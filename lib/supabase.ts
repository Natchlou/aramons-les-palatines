/**
 * ============================================================================
 * Supabase CRUD générique — version unifiée
 * ============================================================================
 *
 * Ce fichier regroupe :
 *   - les types (FilterOptions, SortOptions, CrudResult, ...)
 *   - les constructeurs de filtres/tri (eq, neq, inList, isNull, ...)
 *   - la classe SupabaseCrud + factory
 *   - les utilitaires de résultat (isSuccess, getData, ...)
 *
 * Le client Supabase est INJECTÉ dans la classe (pas d'import interne).
 * Cela évite les cycles et rend la classe testable et côté serveur/browser.
 *
 * Note sur les types : ce fichier n'utilise AUCUN `any`. Les builders Supabase
 * sont décrits par des interfaces structurelles (Loose*) car leur type réel
 * est trop récursif pour être manipulé dynamiquement. Les données de sortie
 * sont typées `unknown` puis converties explicitement vers `T`.
 */

import type {
  SupabaseClient,
  PostgrestError,
} from "@supabase/supabase-js";

// ============================================================================
// TYPES DE BASE
// ============================================================================

/** Opérateurs de filtre supportés par Supabase */
export type SupabaseOperator =
  | "eq" | "neq" | "gt" | "gte" | "lt" | "lte"
  | "like" | "ilike"
  | "is" | "in"
  | "contains" | "containedBy"
  | "textSearch";

/**
 * Nom de colonne accepté dans les filtres / tris / sélections.
 *
 * - Si `T` est un type concret (ex: `Menage`) → `keyof T & string` → auto-complétion
 *   dans l'éditeur et vérification stricte des noms de colonnes.
 * - Si `T` n'a pas été renseigné (`object`, `unknown`, `{}`…) → `string`, pour ne
 *   pas bloquer l'appel : on peut typer le service plus tard sans refactor.
 *
 * Sans ce garde-fou, `createClientCrud(client, "menages")` (sans `<Menage>`)
 * produirait `FilterOptions<object>` dont `column` vaudrait `never`, et toute
 * string serait refusée avec :
 *   « Type 'string' is not assignable to type 'never' ».
 */
type ColumnName<T> = [keyof T] extends [never] ? string : keyof T & string;

export interface FilterOptions<T> {
  column: ColumnName<T>;
  operator: SupabaseOperator;
  value: unknown;
  /** Inverse le filtre avec `.not()` (ex : NOT ILIKE, IS NOT NULL…) */
  negate?: boolean;
  /** Options additionnelles (ex : { type: "websearch" } pour textSearch) */
  options?: Record<string, unknown>;
}

export interface SortOptions<T> {
  column: ColumnName<T>;
  ascending?: boolean;
  nullsFirst?: boolean;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

export interface SelectOptions<T> {
  columns?: ColumnName<T>[];
  count?: "exact" | "planned" | "estimated";
}

export interface GetOptions<T> {
  filters?: FilterOptions<T>[];
  sort?: SortOptions<T>[];
  pagination?: PaginationOptions;
  select?: SelectOptions<T>;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type CrudError = PostgrestError | Error;

/**
 * Résultat standardisé.
 * `success = true` signifie que la requête a abouti SANS erreur DB.
 * `data = null` peut donc être un résultat valide (ex : getById non trouvé).
 */
export interface CrudResult<T> {
  success: boolean;
  data: T | null;
  error: CrudError | null;
  count?: number;
}

// ============================================================================
// TYPES UTILITAIRES POUR TABLES
// ============================================================================

export interface WithTimestamps {
  created_at?: string;
  updated_at?: string;
}

export interface WithUUID {
  id: string;
}

export interface WithAutoIncrementID {
  id: number;
}

export interface WithAuditFields extends WithTimestamps {
  created_by?: string;
  updated_by?: string;
}

export interface WithSoftDelete {
  deleted_at?: string | null;
  is_deleted?: boolean;
}

export type SupabaseTableType<T> = T & WithTimestamps;

// ============================================================================
// TYPES STRUCTURELS POUR LES BUILDERS SUPABASE (remplace les `any`)
// ============================================================================

/**
 * Forme minimale du résultat résolu d'une query PostgREST.
 * `count` n'est présent que si `{ count: "exact" }` a été demandé.
 */
interface QueryResult {
  data: unknown;
  error: PostgrestError | null;
  count?: number | null;
}

/**
 * Interface structurelle du builder de requête Supabase.
 *
 * Chaque méthode retourne le même type pour permettre le chaînage.
 * Le type hérite de `PromiseLike<QueryResult>` pour rester awaitable.
 */
interface LooseQueryBuilder extends PromiseLike<QueryResult> {
  // Filtres
  not(column: string, operator: string, value: unknown): LooseQueryBuilder;
  eq(column: string, value: unknown): LooseQueryBuilder;
  neq(column: string, value: unknown): LooseQueryBuilder;
  gt(column: string, value: unknown): LooseQueryBuilder;
  gte(column: string, value: unknown): LooseQueryBuilder;
  lt(column: string, value: unknown): LooseQueryBuilder;
  lte(column: string, value: unknown): LooseQueryBuilder;
  like(column: string, pattern: string): LooseQueryBuilder;
  ilike(column: string, pattern: string): LooseQueryBuilder;
  is(column: string, value: unknown): LooseQueryBuilder;
  in(column: string, values: readonly unknown[]): LooseQueryBuilder;
  contains(column: string, value: unknown): LooseQueryBuilder;
  containedBy(column: string, value: unknown): LooseQueryBuilder;
  textSearch(
    column: string,
    query: string,
    options?: Record<string, unknown>,
  ): LooseQueryBuilder;
  filter(column: string, operator: string, value: unknown): LooseQueryBuilder;

  // Tri / pagination
  order(
    column: string,
    options?: { ascending?: boolean; nullsFirst?: boolean },
  ): LooseQueryBuilder;
  range(from: number, to: number): LooseQueryBuilder;
  limit(count: number): LooseQueryBuilder;

  // Sélection / terminaux
  select(
    columns?: string,
    options?: { count?: string; head?: boolean },
  ): LooseQueryBuilder;
  single(): LooseQueryBuilder;
  maybeSingle(): LooseQueryBuilder;
}

/**
 * Interface structurelle du builder de table (résultat de `client.from(...)`).
 * Expose les opérations d'écriture et la sélection.
 */
interface LooseTableBuilder {
  select(
    columns?: string,
    options?: { count?: string; head?: boolean },
  ): LooseQueryBuilder;
  insert(values: unknown): LooseQueryBuilder;
  update(values: unknown): LooseQueryBuilder;
  delete(): LooseQueryBuilder;
  upsert(
    values: unknown,
    options?: Record<string, unknown>,
  ): LooseQueryBuilder;
}

/**
 * Vue "relâchée" du client Supabase, utilisée en interne pour contourner
 * les génériques conditionnels de `supabase-js` sans utiliser `any`.
 */
interface LooseClient {
  from(relation: string): LooseTableBuilder;
  rpc(
    fn: string,
    params?: Record<string, unknown>,
  ): Promise<{ data: unknown; error: PostgrestError | null }>;
}

// Helpers de conversion `unknown` → type attendu (remplacent `as any`)

const asRecord = <T>(value: unknown): T | null =>
  value === null || value === undefined ? null : (value as T);

const asRecords = <T>(value: unknown): T[] =>
  Array.isArray(value) ? (value as T[]) : [];

// ============================================================================
// CONSTRUCTEURS DE FILTRES
// ============================================================================

const makeFilter = <T>(
  column: ColumnName<T>,
  operator: SupabaseOperator,
  value: unknown,
  extra?: Partial<FilterOptions<T>>,
): FilterOptions<T> => ({ column, operator, value, ...extra });

export const eq          = <T>(c: ColumnName<T>, v: unknown) => makeFilter<T>(c, "eq", v);
export const neq         = <T>(c: ColumnName<T>, v: unknown) => makeFilter<T>(c, "neq", v);
export const gt          = <T>(c: ColumnName<T>, v: unknown) => makeFilter<T>(c, "gt", v);
export const gte         = <T>(c: ColumnName<T>, v: unknown) => makeFilter<T>(c, "gte", v);
export const lt          = <T>(c: ColumnName<T>, v: unknown) => makeFilter<T>(c, "lt", v);
export const lte         = <T>(c: ColumnName<T>, v: unknown) => makeFilter<T>(c, "lte", v);

/** LIKE brut (vous fournissez les `%`) */
export const like        = <T>(c: ColumnName<T>, pattern: string) => makeFilter<T>(c, "like", pattern);
/** ILIKE brut (vous fournissez les `%`) */
export const ilike       = <T>(c: ColumnName<T>, pattern: string) => makeFilter<T>(c, "ilike", pattern);

/** ILIKE %value% — contient (insensible à la casse) */
export const contains    = <T>(c: ColumnName<T>, v: string) => makeFilter<T>(c, "ilike", `%${v}%`);
/** ILIKE value% — commence par */
export const startsWith  = <T>(c: ColumnName<T>, v: string) => makeFilter<T>(c, "ilike", `${v}%`);
/** ILIKE %value — termine par */
export const endsWith    = <T>(c: ColumnName<T>, v: string) => makeFilter<T>(c, "ilike", `%${v}`);

/** IN (…valeurs) — passe un vrai tableau */
export const inList      = <T>(c: ColumnName<T>, values: readonly unknown[]) =>
  makeFilter<T>(c, "in", values as unknown[]);

/** IS NULL */
export const isNull      = <T>(c: ColumnName<T>) => makeFilter<T>(c, "is", null);
/** IS NOT NULL — correctement implémenté via `.not(col, 'is', null)` */
export const isNotNull   = <T>(c: ColumnName<T>) => makeFilter<T>(c, "is", null, { negate: true });

/** NOT EQ */
export const notEq       = <T>(c: ColumnName<T>, v: unknown) => makeFilter<T>(c, "eq", v, { negate: true });

/** Contient (JSON/array) */
export const jsonContains = <T>(c: ColumnName<T>, v: unknown) => makeFilter<T>(c, "contains", v);
/** Est contenu dans (JSON/array) */
export const jsonContainedBy = <T>(c: ColumnName<T>, v: unknown) => makeFilter<T>(c, "containedBy", v);

/** Full-text search */
export const textSearch = <T>(
  c: ColumnName<T>,
  query: string,
  options?: { type?: "plain" | "phrase" | "websearch"; config?: string },
) => makeFilter<T>(c, "textSearch", query, { options });

// ============================================================================
// CONSTRUCTEURS DE TRI
// ============================================================================

export const asc  = <T>(column: ColumnName<T>, nullsFirst = false): SortOptions<T> =>
  ({ column, ascending: true, nullsFirst });
export const desc = <T>(column: ColumnName<T>, nullsFirst = false): SortOptions<T> =>
  ({ column, ascending: false, nullsFirst });

export const newestFirst = <T extends WithTimestamps>(
  column: ColumnName<T> = "created_at" as ColumnName<T>,
): SortOptions<T> => ({ column, ascending: false });

export const oldestFirst = <T extends WithTimestamps>(
  column: ColumnName<T> = "created_at" as ColumnName<T>,
): SortOptions<T> => ({ column, ascending: true });

// ============================================================================
// PAGINATION
// ============================================================================

export const DEFAULT_PAGINATION   = { page: 1, pageSize: 10   } as const;
export const LONG_LIST_PAGINATION = { page: 1, pageSize: 50   } as const;
export const EXPORT_PAGINATION    = { page: 1, pageSize: 1000 } as const;

// ============================================================================
// UTILITAIRES DE RÉSULTAT
// ============================================================================

export const isSuccess = <T>(r: CrudResult<T>): r is { success: true; data: T; error: null } =>
  r.success;

export const isError = <T>(r: CrudResult<T>): r is { success: false; data: null; error: CrudError } =>
  !r.success;

/** Extrait data ou lève l'erreur */
export const getData = <T>(r: CrudResult<T>): T => {
  if (!r.success) throw r.error ?? new Error("CRUD operation failed");
  // data peut être null pour getById() "non trouvé" ; on retourne tel quel
  return r.data as T;
};

/** Extrait data ou retourne null */
export const getDataOrNull = <T>(r: CrudResult<T>): T | null =>
  r.success ? r.data : null;

/** Extrait data ou fallback */
export const getDataOrDefault = <T>(r: CrudResult<T>, fallback: T): T =>
  r.success && r.data !== null ? r.data : fallback;

/** Log + retour data/null — pratique dans les handlers UI */
export async function handleCrudResult<T>(
  result: CrudResult<T>,
  successMessage?: string,
  errorMessage?: string,
): Promise<T | null> {
  if (result.success) {
    if (successMessage) console.log(successMessage);
    return result.data;
  }
  if (errorMessage) console.error(errorMessage, result.error);
  return null;
}

// ============================================================================
// CLASSE CRUD
// ============================================================================

export class SupabaseCrud<
  T extends object,
  K extends keyof T & string = "id" & keyof T & string,
  TInsert extends object = Omit<T, K>,
  TUpdate extends object = Partial<TInsert>,
> {
  constructor(
    private readonly client: SupabaseClient,
    private readonly tableName: string,
    private readonly primaryKey: K = "id" as K,
  ) {}

  /** Vue "relâchée" du client — évite les génériques conditionnels de Supabase. */
  private get db(): LooseClient {
    return this.client as unknown as LooseClient;
  }

  // ---- Application des filtres / tri / pagination sur une query ----

  private applyFilters<Q>(query: Q, filters?: FilterOptions<T>[]): Q {
    if (!filters?.length) return query;
    let q = query as unknown as LooseQueryBuilder;

    for (const f of filters) {
      const { column, operator, value, negate, options } = f;

      if (negate) {
        q = q.not(column, operator, value);
        continue;
      }

      switch (operator) {
        case "eq":          q = q.eq(column, value);                               break;
        case "neq":         q = q.neq(column, value);                              break;
        case "gt":          q = q.gt(column, value);                               break;
        case "gte":         q = q.gte(column, value);                              break;
        case "lt":          q = q.lt(column, value);                               break;
        case "lte":         q = q.lte(column, value);                              break;
        case "like":        q = q.like(column, value as string);                   break;
        case "ilike":       q = q.ilike(column, value as string);                  break;
        case "is":          q = q.is(column, value);                               break;
        case "in":          q = q.in(column, value as readonly unknown[]);         break;
        case "contains":    q = q.contains(column, value);                         break;
        case "containedBy": q = q.containedBy(column, value);                      break;
        case "textSearch":  q = q.textSearch(column, value as string, options);    break;
        default:            q = q.filter(column, operator, value);
      }
    }
    return q as unknown as Q;
  }

  private applySort<Q>(query: Q, sort?: SortOptions<T>[]): Q {
    if (!sort?.length) return query;
    let q = query as unknown as LooseQueryBuilder;
    for (const s of sort) {
      q = q.order(s.column, {
        ascending: s.ascending !== false,
        nullsFirst: s.nullsFirst,
      });
    }
    return q as unknown as Q;
  }

  private applyPagination<Q>(query: Q, pagination?: PaginationOptions): Q {
    if (!pagination) return query;
    const { limit, offset, page, pageSize } = pagination;

    const effectiveLimit  = limit ?? pageSize;
    let effectiveOffset = offset;

    if (effectiveOffset === undefined && page !== undefined && pageSize !== undefined) {
      effectiveOffset = (page - 1) * pageSize;
    }

    let q = query as unknown as LooseQueryBuilder;
    if (effectiveOffset !== undefined && effectiveLimit !== undefined) {
      q = q.range(effectiveOffset, effectiveOffset + effectiveLimit - 1);
    } else if (effectiveLimit !== undefined) {
      q = q.limit(effectiveLimit);
    }
    return q as unknown as Q;
  }

  private columnsOf(select?: SelectOptions<T>): string {
    return select?.columns?.length ? select.columns.join(",") : "*";
  }

  // ---- LECTURE ----------------------------------------------------------

  /** Tous les enregistrements (avec filtres / tri / pagination optionnels) */
  async getAll(options?: GetOptions<T>): Promise<CrudResult<T[]>> {
    try {
      let query = this.db.from(this.tableName).select(this.columnsOf(options?.select));
      query = this.applyFilters(query, options?.filters);
      query = this.applySort(query, options?.sort);
      query = this.applyPagination(query, options?.pagination);

      const { data, error } = await query;
      if (error) return { success: false, data: null, error };
      return { success: true, data: asRecords<T>(data), error: null };
    } catch (e) {
      return { success: false, data: null, error: e as Error };
    }
  }

  /** Version paginée (avec count total) */
  async getAllPaginated(
    pagination: PaginationOptions = {},
    options?: Omit<GetOptions<T>, "pagination">,
  ): Promise<CrudResult<PaginatedResult<T>>> {
    try {
      const page     = pagination.page ?? 1;
      const pageSize = pagination.pageSize ?? pagination.limit ?? 10;
      const offset   = pagination.offset ?? (page - 1) * pageSize;

      let query = this.db
        .from(this.tableName)
        .select(this.columnsOf(options?.select), { count: "exact" });
      query = this.applyFilters(query, options?.filters);
      query = this.applySort(query, options?.sort);
      query = query.range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;
      if (error) return { success: false, data: null, error };

      const totalItems = count ?? 0;
      const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0;

      return {
        success: true,
        error: null,
        data: {
          data: asRecords<T>(data),
          count: totalItems,
          page,
          pageSize,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (e) {
      return { success: false, data: null, error: e as Error };
    }
  }

  async getById(id: T[K]): Promise<CrudResult<T>> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .select("*")
        .eq(this.primaryKey, id)
        .maybeSingle();
      if (error) return { success: false, data: null, error };
      return { success: true, data: asRecord<T>(data), error: null };
    } catch (e) {
      return { success: false, data: null, error: e as Error };
    }
  }

  async getFirst(options?: GetOptions<T>): Promise<CrudResult<T>> {
    const r = await this.getAll({ ...options, pagination: { limit: 1 } });
    if (!r.success) return { success: false, data: null, error: r.error };
    return { success: true, data: r.data?.[0] ?? null, error: null };
  }

  async getByIds(ids: T[K][]): Promise<CrudResult<T[]>> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .select("*")
        .in(this.primaryKey, ids);
      if (error) return { success: false, data: null, error };
      return { success: true, data: asRecords<T>(data), error: null };
    } catch (e) {
      return { success: false, data: null, error: e as Error };
    }
  }

  /** Alias de getAll (compat avec l'ancien code) */
  getWithFilters(options?: GetOptions<T>): Promise<CrudResult<T[]>> {
    return this.getAll(options);
  }

  // ---- ÉCRITURE ---------------------------------------------------------

  async create(item: TInsert): Promise<CrudResult<T>> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .insert(item)
        .select()
        .single();
      if (error) return { success: false, data: null, error };
      return { success: true, data: asRecord<T>(data), error: null };
    } catch (e) {
      return { success: false, data: null, error: e as Error };
    }
  }

  async createMany(items: TInsert[]): Promise<CrudResult<T[]>> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .insert(items)
        .select();
      if (error) return { success: false, data: null, error };
      return { success: true, data: asRecords<T>(data), error: null };
    } catch (e) {
      return { success: false, data: null, error: e as Error };
    }
  }

  /** Insert-or-update : utile pour les ids connus côté client */
  async upsert(
    item: TInsert | TInsert[],
    options?: { onConflict?: string; ignoreDuplicates?: boolean },
  ): Promise<CrudResult<T[]>> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .upsert(item, options)
        .select();
      if (error) return { success: false, data: null, error };
      return { success: true, data: asRecords<T>(data), error: null };
    } catch (e) {
      return { success: false, data: null, error: e as Error };
    }
  }

  async update(id: T[K], updates: TUpdate): Promise<CrudResult<T>> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .update(updates)
        .eq(this.primaryKey, id)
        .select()
        .single();
      if (error) return { success: false, data: null, error };
      return { success: true, data: asRecord<T>(data), error: null };
    } catch (e) {
      return { success: false, data: null, error: e as Error };
    }
  }

  async updateMany(
    filters: FilterOptions<T>[],
    updates: TUpdate,
  ): Promise<CrudResult<T[]>> {
    try {
      let query = this.db.from(this.tableName).update(updates);
      query = this.applyFilters(query, filters);
      const { data, error } = await query.select();
      if (error) return { success: false, data: null, error };
      return { success: true, data: asRecords<T>(data), error: null };
    } catch (e) {
      return { success: false, data: null, error: e as Error };
    }
  }

  /** Supprime par id et renvoie l'enregistrement supprimé (en 1 seule requête) */
  async delete(id: T[K]): Promise<CrudResult<T>> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .delete()
        .eq(this.primaryKey, id)
        .select()
        .maybeSingle();

      if (error) return { success: false, data: null, error };
      if (data === null || data === undefined) {
        return {
          success: false,
          data: null,
          error: new Error(`No record found with ${this.primaryKey} = ${String(id)}`),
        };
      }
      return { success: true, data: asRecord<T>(data), error: null };
    } catch (e) {
      return { success: false, data: null, error: e as Error };
    }
  }

  async deleteMany(ids: T[K][]): Promise<CrudResult<T[]>> {
    try {
      const { data, error } = await this.db
        .from(this.tableName)
        .delete()
        .in(this.primaryKey, ids)
        .select();

      if (error) return { success: false, data: null, error };
      const records = asRecords<T>(data);
      if (!records.length) {
        return {
          success: false,
          data: null,
          error: new Error("No records found with the provided IDs"),
        };
      }
      return { success: true, data: records, error: null };
    } catch (e) {
      return { success: false, data: null, error: e as Error };
    }
  }

  async deleteWithFilters(filters: FilterOptions<T>[]): Promise<CrudResult<T[]>> {
    try {
      let query = this.db.from(this.tableName).delete();
      query = this.applyFilters(query, filters);
      const { data, error } = await query.select();

      if (error) return { success: false, data: null, error };
      const records = asRecords<T>(data);
      if (!records.length) {
        return {
          success: false,
          data: null,
          error: new Error("No records found with the provided filters"),
        };
      }
      return { success: true, data: records, error: null };
    } catch (e) {
      return { success: false, data: null, error: e as Error };
    }
  }

  // ---- UTILITAIRES ------------------------------------------------------

  /** Compte les lignes (avec filtres optionnels) sans rapatrier les données */
  async count(filters?: FilterOptions<T>[]): Promise<CrudResult<number>> {
    try {
      let query = this.db
        .from(this.tableName)
        .select("*", { count: "exact", head: true });
      query = this.applyFilters(query, filters);
      const { count, error } = await query;
      if (error) return { success: false, data: null, error };
      return { success: true, data: count ?? 0, error: null };
    } catch (e) {
      return { success: false, data: null, error: e as Error };
    }
  }

  async exists(id: T[K]): Promise<CrudResult<boolean>> {
    const r = await this.getById(id);
    return {
      success: r.success,
      data: r.success ? r.data !== null : false,
      error: r.error,
    };
  }

  async rpc<R = unknown>(
    functionName: string,
    params?: Record<string, unknown>,
  ): Promise<CrudResult<R>> {
    try {
      const { data, error } = await this.db.rpc(functionName, params ?? {});
      if (error) return { success: false, data: null, error };
      return { success: true, data: data as R, error: null };
    } catch (e) {
      return { success: false, data: null, error: e as Error };
    }
  }
}

// ============================================================================
// FACTORY
// ============================================================================

export function createClientCrud<
  T extends object,
  K extends keyof T & string = "id" & keyof T & string,
  TInsert extends object = Omit<T, K>,
  TUpdate extends object = Partial<TInsert>,
>(
  client: SupabaseClient,
  tableName: string,
  primaryKey: K = "id" as K,
): SupabaseCrud<T, K, TInsert, TUpdate> {
  return new SupabaseCrud<T, K, TInsert, TUpdate>(client, tableName, primaryKey);
}

export default SupabaseCrud;