import { createClient } from "@/lib/client";

/**
 * Options de filtrage
 */
export interface FilterOptions<T> {
  column: keyof T;
  operator:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "like"
    | "ilike"
    | "is"
    | "in"
    | "contains"
    | "contained"
    | "range";
  value: unknown;
}

/**
 * Options de tri
 */
export interface SortOptions<T> {
  column: keyof T;
  ascending?: boolean;
}

/**
 * Options de pagination
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

/**
 * Options de sélection
 */
export interface SelectOptions<T> {
  columns?: (keyof T)[];
}

/**
 * Options de requête
 */
export interface GetOptions<T> {
  filters?: FilterOptions<T>[];
  sort?: SortOptions<T>[];
  pagination?: PaginationOptions;
  select?: SelectOptions<T>;
}

/**
 * Résultat paginé
 */
export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Résultat CRUD
 */
export interface CrudResult<T> {
  success: boolean;
  data?: T | T[] | null;
  error?: Error | null;
  count?: number;
}

/**
 * CRUD Supabase côté client.
 *
 * Ce fichier ne doit utiliser QUE le client navigateur.
 *
 * Paramètres génériques :
 * - T : type de ligne (Row)
 * - K : clé primaire (par défaut "id")
 * - TInsert : type accepté à la création (par défaut Omit<T, K>).
 *   Passer le type `Insert` généré par Supabase pour que les colonnes
 *   avec valeur par défaut (created_at, etc.) soient optionnelles.
 */
export class SupabaseCrud<
  T extends Record<string, any>,
  K extends keyof T = "id",
  TInsert extends Record<string, any> = Omit<T, K>,
> {
  private tableName: string;
  private primaryKey: K;

  constructor(
    tableName: string,
    primaryKey: K = "id" as K,
  ) {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  /**
   * Client Supabase navigateur
   */
  private getClient() {
    return createClient();
  }

  /**
   * Récupère tous les enregistrements
   */
  async getAll(
    options?: GetOptions<T>,
  ): Promise<CrudResult<T[]>> {
    try {
      const client = this.getClient();

      const columns =
        options?.select?.columns?.length
          ? options.select.columns.join(",")
          : "*";

      let query = client
        .from(this.tableName)
        .select(columns);

      if (options?.filters) {
        for (const filter of options.filters) {
          query = query.filter(
            filter.column as string,
            filter.operator,
            filter.value,
          );
        }
      }

      if (options?.sort) {
        for (const sort of options.sort) {
          query = query.order(
            sort.column as string,
            {
              ascending: sort.ascending !== false,
            },
          );
        }
      }

      if (options?.pagination) {
        const {
          limit,
          offset,
        } = options.pagination;

        if (offset !== undefined && limit !== undefined) {
          query = query.range(
            offset,
            offset + limit - 1,
          );
        } else if (limit !== undefined) {
          query = query.limit(limit);
        }
      }

      const { data, error } = await query;

      if (error) {
        return {
          success: false,
          data: null,
          error,
        };
      }

      return {
        success: true,
        data: data as unknown as T[],
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Récupère les enregistrements avec pagination
   */
  async getAllPaginated(
    pagination: PaginationOptions = {},
    options?: Omit<GetOptions<T>, "pagination">,
  ): Promise<CrudResult<PaginatedResult<T>>> {
    try {
      const client = this.getClient();

      const page = pagination.page ?? 1;
      const pageSize =
        pagination.pageSize ??
        pagination.limit ??
        10;

      const offset =
        pagination.offset ??
        (page - 1) * pageSize;

      const columns =
        options?.select?.columns?.length
          ? options.select.columns.join(",")
          : "*";

      let query = client
        .from(this.tableName)
        .select(columns, {
          count: "exact",
        });

      if (options?.filters) {
        for (const filter of options.filters) {
          query = query.filter(
            filter.column as string,
            filter.operator,
            filter.value,
          );
        }
      }

      if (options?.sort) {
        for (const sort of options.sort) {
          query = query.order(
            sort.column as string,
            {
              ascending: sort.ascending !== false,
            },
          );
        }
      }

      const {
        data,
        error,
        count,
      } = await query.range(
        offset,
        offset + pageSize - 1,
      );

      if (error) {
        return {
          success: false,
          data: null,
          error,
        };
      }

      const totalItems = count ?? 0;
      const totalPages =
        Math.ceil(totalItems / pageSize);

      return {
        success: true,
        data: {
          data: data as unknown as T[],
          count: totalItems,
          page,
          pageSize,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Récupère un enregistrement par son ID
   */
  async getById(
    id: T[K],
  ): Promise<CrudResult<T | null>> {
    try {
      const client = this.getClient();

      const {
        data,
        error,
      } = await client
        .from(this.tableName)
        .select("*")
        .eq(this.primaryKey as string, id)
        .maybeSingle();

      if (error) {
        return {
          success: false,
          data: null,
          error,
        };
      }

      return {
        success: true,
        data: data as T | null,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Récupère le premier résultat
   */
  async getFirst(
    options?: GetOptions<T>,
  ): Promise<CrudResult<T | null>> {
    const result = await this.getAll({
      ...options,
      pagination: {
        limit: 1,
      },
    });

    if (!result.success) {
      return {
        success: false,
        data: null,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data?.[0] ?? null,
      error: null,
    };
  }

  /**
   * Récupère plusieurs IDs
   */
  async getByIds(
    ids: T[K][],
  ): Promise<CrudResult<T[]>> {
    try {
      const client = this.getClient();

      const {
        data,
        error,
      } = await client
        .from(this.tableName)
        .select("*")
        .in(this.primaryKey as string, ids);

      if (error) {
        return {
          success: false,
          data: null,
          error,
        };
      }

      return {
        success: true,
        data: data as T[],
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Recherche avec filtres
   */
  async getWithFilters(
    options?: GetOptions<T>,
  ): Promise<CrudResult<T[]>> {
    return this.getAll(options);
  }

  /**
   * Crée un enregistrement
   */
  async create(
    item: TInsert,
  ): Promise<CrudResult<T>> {
    try {
      const client = this.getClient();

      const {
        data,
        error,
      } = await client
        .from(this.tableName)
        .insert(item as any)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          data: null,
          error,
        };
      }

      return {
        success: true,
        data: data as T,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Crée plusieurs enregistrements
   */
  async createMany(
    items: TInsert[],
  ): Promise<CrudResult<T[]>> {
    try {
      const client = this.getClient();

      const {
        data,
        error,
      } = await client
        .from(this.tableName)
        .insert(items as any)
        .select();

      if (error) {
        return {
          success: false,
          data: null,
          error,
        };
      }

      return {
        success: true,
        data: data as T[],
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Met à jour un enregistrement
   */
  async update(
    id: T[K],
    updates: Partial<T>,
  ): Promise<CrudResult<T>> {
    try {
      const client = this.getClient();

      const {
        data,
        error,
      } = await client
        .from(this.tableName)
        .update(updates as any)
        .eq(this.primaryKey as string, id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          data: null,
          error,
        };
      }

      return {
        success: true,
        data: data as T,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Met à jour plusieurs enregistrements
   */
  async updateMany(
    filters: FilterOptions<T>[],
    updates: Partial<T>,
  ): Promise<CrudResult<T[]>> {
    try {
      const client = this.getClient();

      let query = client
        .from(this.tableName)
        .update(updates as any);

      for (const filter of filters) {
        query = query.filter(
          filter.column as string,
          filter.operator,
          filter.value,
        );
      }

      const {
        data,
        error,
      } = await query.select();

      if (error) {
        return {
          success: false,
          data: null,
          error,
        };
      }

      return {
        success: true,
        data: data as T[],
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Supprime un enregistrement
   */
  async delete(
    id: T[K],
  ): Promise<CrudResult<T>> {
    try {
      const client = this.getClient();

      const {
        data: existingData,
        error: fetchError,
      } = await client
        .from(this.tableName)
        .select("*")
        .eq(this.primaryKey as string, id)
        .maybeSingle();

      if (fetchError) {
        return {
          success: false,
          data: null,
          error: fetchError,
        };
      }

      if (!existingData) {
        return {
          success: false,
          data: null,
          error: new Error(
            `No record found with ${String(this.primaryKey)} = ${String(id)}`,
          ),
        };
      }

      const {
        error: deleteError,
      } = await client
        .from(this.tableName)
        .delete()
        .eq(this.primaryKey as string, id);

      if (deleteError) {
        return {
          success: false,
          data: null,
          error: deleteError,
        };
      }

      return {
        success: true,
        data: existingData as T,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Supprime plusieurs enregistrements
   */
  async deleteMany(
    ids: T[K][],
  ): Promise<CrudResult<T[]>> {
    try {
      const client = this.getClient();

      const {
        data: existingData,
        error: fetchError,
      } = await client
        .from(this.tableName)
        .select("*")
        .in(this.primaryKey as string, ids);

      if (fetchError) {
        return {
          success: false,
          data: null,
          error: fetchError,
        };
      }

      if (!existingData?.length) {
        return {
          success: false,
          data: null,
          error: new Error(
            "No records found with the provided IDs",
          ),
        };
      }

      const {
        error: deleteError,
      } = await client
        .from(this.tableName)
        .delete()
        .in(this.primaryKey as string, ids);

      if (deleteError) {
        return {
          success: false,
          data: null,
          error: deleteError,
        };
      }

      return {
        success: true,
        data: existingData as T[],
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Supprime selon des filtres
   */
  async deleteWithFilters(
    filters: FilterOptions<T>[],
  ): Promise<CrudResult<T[]>> {
    try {
      const client = this.getClient();

      let fetchQuery = client
        .from(this.tableName)
        .select("*");

      for (const filter of filters) {
        fetchQuery = fetchQuery.filter(
          filter.column as string,
          filter.operator,
          filter.value,
        );
      }

      const {
        data: existingData,
        error: fetchError,
      } = await fetchQuery;

      if (fetchError) {
        return {
          success: false,
          data: null,
          error: fetchError,
        };
      }

      if (!existingData?.length) {
        return {
          success: false,
          data: null,
          error: new Error(
            "No records found with the provided filters",
          ),
        };
      }

      let deleteQuery = client
        .from(this.tableName)
        .delete();

      for (const filter of filters) {
        deleteQuery = deleteQuery.filter(
          filter.column as string,
          filter.operator,
          filter.value,
        );
      }

      const {
        error: deleteError,
      } = await deleteQuery;

      if (deleteError) {
        return {
          success: false,
          data: null,
          error: deleteError,
        };
      }

      return {
        success: true,
        data: existingData as T[],
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Compte les enregistrements
   */
  async count(
    filters?: FilterOptions<T>[],
  ): Promise<CrudResult<number>> {
    try {
      const client = this.getClient();

      let query = client
        .from(this.tableName)
        .select("*", {
          count: "exact",
          head: true,
        });

      if (filters) {
        for (const filter of filters) {
          query = query.filter(
            filter.column as string,
            filter.operator,
            filter.value,
          );
        }
      }

      const {
        count,
        error,
      } = await query;

      if (error) {
        return {
          success: false,
          data: null,
          error,
        };
      }

      return {
        success: true,
        data: count ?? 0,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Vérifie l'existence d'un enregistrement
   */
  async exists(
    id: T[K],
  ): Promise<CrudResult<boolean>> {
    const result = await this.getById(id);

    return {
      success: result.success,
      data: !!result.data,
      error: result.error,
    };
  }

  /**
   * Appelle une fonction RPC
   */
  async rpc(
    functionName: string,
    params?: Record<string, unknown>,
  ): Promise<CrudResult<any>> {
    try {
      const client = this.getClient();

      const {
        data,
        error,
      } = await client.rpc(
        functionName,
        params || {},
      );

      if (error) {
        return {
          success: false,
          data: null,
          error,
        };
      }

      return {
        success: true,
        data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error as Error,
      };
    }
  }
}

/**
 * Création d'un CRUD client
 */
export function createClientCrud<
  T extends Record<string, any>,
  K extends keyof T = "id",
  TInsert extends Record<string, any> = Omit<T, K>,
>(
  tableName: string,
  primaryKey: K = "id" as K,
) {
  return new SupabaseCrud<T, K, TInsert>(
    tableName,
    primaryKey,
  );
}

export type SupabaseTableType<T> = T & {
  created_at?: string;
  updated_at?: string;
};

export default SupabaseCrud;