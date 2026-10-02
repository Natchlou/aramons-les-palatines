import { createClient as createBrowserClient } from './client'
import { createClient as createServerClient } from './server'
import { cookies } from 'next/headers'

/**
 * Options de filtrage pour les requêtes
 */
export interface FilterOptions<T> {
  column: keyof T
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'is' | 'in' | 'contains' | 'contained' | 'range'
  value: any
}

/**
 * Options de tri
 */
export interface SortOptions<T> {
  column: keyof T
  ascending?: boolean
}

/**
 * Options de pagination
 */
export interface PaginationOptions {
  limit?: number
  offset?: number
  page?: number
  pageSize?: number
}

/**
 * Options de sélection de colonnes
 */
export interface SelectOptions<T> {
  columns?: (keyof T)[]
}

/**
 * Options pour les requêtes get
 */
export interface GetOptions<T> {
  filters?: FilterOptions<T>[]
  sort?: SortOptions<T>[]
  pagination?: PaginationOptions
  select?: SelectOptions<T>
}

/**
 * Résultat paginé
 */
export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Résultat des opérations CRUD
 */
export interface CrudResult<T> {
  success: boolean
  data?: T | T[] | null
  error?: Error | null
  count?: number
}

/**
 * Classe de base générique pour les opérations CRUD sur Supabase
 * 
 * @example
 * ```typescript
 * // Définir une interface pour votre table
 * interface User {
 *   id: string
 *   name: string
 *   email: string
 *   created_at?: string
 * }
 * 
 * // Créer un service pour la table users
 * const userService = new SupabaseCrud<User>('users')
 * 
 * // Utilisation côté client
 * const users = await userService.getAll()
 * 
 * // Utilisation côté serveur
 * const serverUserService = new SupabaseCrud<User>('users', 'server')
 * const user = await serverUserService.getById('user-123')
 * ```
 */
export class SupabaseCrud<T extends Record<string, any>, K extends keyof T = 'id'> {
  private tableName: string
  private primaryKey: K
  private clientType: 'client' | 'server'

  /**
   * Crée une nouvelle instance du service CRUD
   * 
   * @param tableName - Nom de la table dans Supabase
   * @param primaryKey - Clé primaire de la table (par défaut 'id')
   * @param clientType - Type de client: 'client' pour le browser, 'server' pour Next.js server components
   */
  constructor(
    tableName: string,
    primaryKey: K = 'id' as K,
    clientType: 'client' | 'server' = 'client'
  ) {
    this.tableName = tableName
    this.primaryKey = primaryKey
    this.clientType = clientType
  }

  /**
   * Obtient le client Supabase approprié
   */
  private async getClient() {
    if (this.clientType === 'server') {
      return await createServerClient()
    }
    return createBrowserClient()
  }

  /**
   * Récupère tous les enregistrements d'une table
   */
  async getAll(options?: Omit<GetOptions<T>, 'filters' | 'sort' | 'pagination'>): Promise<CrudResult<T[]>> {
    try {
      const client = await this.getClient()
      
      let query = client.from(this.tableName).select('*')
      
      // Appliquer la sélection de colonnes si spécifiée
      if (options?.select?.columns && options.select.columns.length > 0) {
        query = client.from(this.tableName).select(options.select.columns.join(','))
      }

      const { data, error } = await query
      
      if (error) {
        return { success: false, data: null, error }
      }
      
      return { success: true, data: data as T[], error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }

  /**
   * Récupère tous les enregistrements avec pagination
   */
  async getAllPaginated(
    pagination: PaginationOptions = {},
    options?: Omit<GetOptions<T>, 'pagination'>
  ): Promise<CrudResult<PaginatedResult<T>>> {
    try {
      const client = await this.getClient()
      
      // Calculer les valeurs de pagination
      const page = pagination.page || 1
      const pageSize = pagination.pageSize || pagination.limit || 10
      const offset = pagination.offset || (page - 1) * pageSize
      
      let query = client.from(this.tableName).select('*', { count: 'exact' })
      
      // Appliquer les filtres
      if (options?.filters) {
        options.filters.forEach(filter => {
          query = query.filter(filter.column as string, filter.operator, filter.value)
        })
      }
      
      // Appliquer le tri
      if (options?.sort) {
        options.sort.forEach(sort => {
          query = query.order(sort.column as string, { ascending: sort.ascending !== false })
        })
      }
      
      // Appliquer la sélection de colonnes
      if (options?.select?.columns && options.select.columns.length > 0) {
        query = client.from(this.tableName).select(options.select.columns.join(','), { count: 'exact' })
        
        // Réappliquer les filtres et le tri
        if (options.filters) {
          options.filters.forEach(filter => {
            query = query.filter(filter.column as string, filter.operator, filter.value)
          })
        }
        
        if (options.sort) {
          options.sort.forEach(sort => {
            query = query.order(sort.column as string, { ascending: sort.ascending !== false })
          })
        }
      }
      
      // Appliquer la pagination
      const { data, error, count } = await query.range(offset, offset + pageSize - 1)
      
      if (error) {
        return { success: false, data: null, error }
      }
      
      const totalItems = count || 0
      const totalPages = Math.ceil(totalItems / pageSize)
      
      const result: PaginatedResult<T> = {
        data: data as T[],
        count: totalItems,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
      
      return { success: true, data: result, error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }

  /**
   * Récupère un enregistrement par sa clé primaire
   */
  async getById(id: T[K]): Promise<CrudResult<T | null>> {
    try {
      const client = await this.getClient()
      
      const { data, error } = await client
        .from(this.tableName)
        .select('*')
        .eq(this.primaryKey as string, id)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        return { success: false, data: null, error }
      }
      
      return { success: true, data: data as T | null, error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }

  /**
   * Récupère le premier enregistrement correspondant aux filtres
   */
  async getFirst(options?: GetOptions<T>): Promise<CrudResult<T | null>> {
    try {
      const client = await this.getClient()
      
      let query = client.from(this.tableName).select('*')
      
      // Appliquer les filtres
      if (options?.filters) {
        options.filters.forEach(filter => {
          query = query.filter(filter.column as string, filter.operator, filter.value)
        })
      }
      
      // Appliquer le tri
      if (options?.sort) {
        options.sort.forEach(sort => {
          query = query.order(sort.column as string, { ascending: sort.ascending !== false })
        })
      }
      
      // Appliquer la sélection de colonnes
      if (options?.select?.columns && options.select.columns.length > 0) {
        query = client.from(this.tableName).select(options.select.columns.join(','))
        
        // Réappliquer les filtres et le tri
        if (options.filters) {
          options.filters.forEach(filter => {
            query = query.filter(filter.column as string, filter.operator, filter.value)
          })
        }
        
        if (options.sort) {
          options.sort.forEach(sort => {
            query = query.order(sort.column as string, { ascending: sort.ascending !== false })
          })
        }
      }
      
      const { data, error } = await query.limit(1).single()
      
      if (error && error.code !== 'PGRST116') {
        return { success: false, data: null, error }
      }
      
      return { success: true, data: data as T | null, error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }

  /**
   * Récupère plusieurs enregistrements par leurs IDs
   */
  async getByIds(ids: T[K][]): Promise<CrudResult<T[]>> {
    try {
      const client = await this.getClient()
      
      const { data, error } = await client
        .from(this.tableName)
        .select('*')
        .in(this.primaryKey as string, ids)
      
      if (error) {
        return { success: false, data: null, error }
      }
      
      return { success: true, data: data as T[], error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }

  /**
   * Récupère des enregistrements avec des filtres personnalisés
   */
  async getWithFilters(options?: GetOptions<T>): Promise<CrudResult<T[]>> {
    try {
      const client = await this.getClient()
      
      let query = client.from(this.tableName).select('*')
      
      // Appliquer les filtres
      if (options?.filters) {
        options.filters.forEach(filter => {
          query = query.filter(filter.column as string, filter.operator, filter.value)
        })
      }
      
      // Appliquer le tri
      if (options?.sort) {
        options.sort.forEach(sort => {
          query = query.order(sort.column as string, { ascending: sort.ascending !== false })
        })
      }
      
      // Appliquer la sélection de colonnes
      if (options?.select?.columns && options.select.columns.length > 0) {
        query = client.from(this.tableName).select(options.select.columns.join(','))
        
        // Réappliquer les filtres et le tri
        if (options.filters) {
          options.filters.forEach(filter => {
            query = query.filter(filter.column as string, filter.operator, filter.value)
          })
        }
        
        if (options.sort) {
          options.sort.forEach(sort => {
            query = query.order(sort.column as string, { ascending: sort.ascending !== false })
          })
        }
      }
      
      // Appliquer la pagination
      if (options?.pagination) {
        const { limit, offset } = options.pagination
        if (limit !== undefined) {
          query = query.limit(limit)
        }
        if (offset !== undefined) {
          query = query.range(offset, offset + (limit || 10) - 1)
        }
      }
      
      const { data, error } = await query
      
      if (error) {
        return { success: false, data: null, error }
      }
      
      return { success: true, data: data as T[], error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }

  /**
   * Crée un nouvel enregistrement
   */
  async create(item: Omit<T, K>): Promise<CrudResult<T>> {
    try {
      const client = await this.getClient()
      
      const { data, error } = await client
        .from(this.tableName)
        .insert(item as any)
        .select()
        .single()
      
      if (error) {
        return { success: false, data: null, error }
      }
      
      return { success: true, data: data as T, error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }

  /**
   * Crée plusieurs enregistrements
   */
  async createMany(items: Omit<T, K>[]): Promise<CrudResult<T[]>> {
    try {
      const client = await this.getClient()
      
      const { data, error } = await client
        .from(this.tableName)
        .insert(items as any)
        .select()
      
      if (error) {
        return { success: false, data: null, error }
      }
      
      return { success: true, data: data as T[], error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }

  /**
   * Met à jour un enregistrement par sa clé primaire
   */
  async update(id: T[K], updates: Partial<T>): Promise<CrudResult<T>> {
    try {
      const client = await this.getClient()
      
      const { data, error } = await client
        .from(this.tableName)
        .update(updates as any)
        .eq(this.primaryKey as string, id)
        .select()
        .single()
      
      if (error) {
        return { success: false, data: null, error }
      }
      
      return { success: true, data: data as T, error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }

  /**
   * Met à jour plusieurs enregistrements correspondant aux filtres
   */
  async updateMany(
    filters: FilterOptions<T>[],
    updates: Partial<T>
  ): Promise<CrudResult<T[]>> {
    try {
      const client = await this.getClient()
      
      let query = client.from(this.tableName).update(updates as any)
      
      // Appliquer les filtres
      filters.forEach(filter => {
        query = query.filter(filter.column as string, filter.operator, filter.value)
      })
      
      const { data, error } = await query.select()
      
      if (error) {
        return { success: false, data: null, error }
      }
      
      return { success: true, data: data as T[], error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }

  /**
   * Remplace complètement un enregistrement
   */
  async replace(id: T[K], newItem: T): Promise<CrudResult<T>> {
    try {
      const client = await this.getClient()
      
      const { data, error } = await client
        .from(this.tableName)
        .upsert(newItem as any)
        .eq(this.primaryKey as string, id)
        .select()
        .single()
      
      if (error) {
        return { success: false, data: null, error }
      }
      
      return { success: true, data: data as T, error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }

  /**
   * Supprime un enregistrement par sa clé primaire
   */
  async delete(id: T[K]): Promise<CrudResult<T>> {
    try {
      const client = await this.getClient()
      
      // D'abord récupérer l'enregistrement avant de le supprimer
      const { data: existingData, error: fetchError } = await client
        .from(this.tableName)
        .select('*')
        .eq(this.primaryKey as string, id)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        return { success: false, data: null, error: fetchError }
      }
      
      if (!existingData) {
        return { 
          success: false, 
          data: null, 
          error: new Error(`No record found with ${this.primaryKey as string} = ${id}`) 
        }
      }
      
      const { error: deleteError } = await client
        .from(this.tableName)
        .delete()
        .eq(this.primaryKey as string, id)
      
      if (deleteError) {
        return { success: false, data: null, error: deleteError }
      }
      
      return { success: true, data: existingData as T, error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }

  /**
   * Supprime plusieurs enregistrements par leurs IDs
   */
  async deleteMany(ids: T[K][]): Promise<CrudResult<T[]>> {
    try {
      const client = await this.getClient()
      
      // D'abord récupérer les enregistrements avant de les supprimer
      const { data: existingData, error: fetchError } = await client
        .from(this.tableName)
        .select('*')
        .in(this.primaryKey as string, ids)
      
      if (fetchError) {
        return { success: false, data: null, error: fetchError }
      }
      
      if (!existingData || existingData.length === 0) {
        return { 
          success: false, 
          data: null, 
          error: new Error(`No records found with the provided IDs`) 
        }
      }
      
      const { error: deleteError } = await client
        .from(this.tableName)
        .delete()
        .in(this.primaryKey as string, ids)
      
      if (deleteError) {
        return { success: false, data: null, error: deleteError }
      }
      
      return { success: true, data: existingData as T[], error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }

  /**
   * Supprime des enregistrements correspondant aux filtres
   */
  async deleteWithFilters(filters: FilterOptions<T>[]): Promise<CrudResult<T[]>> {
    try {
      const client = await this.getClient()
      
      // D'abord récupérer les enregistrements avant de les supprimer
      let query = client.from(this.tableName).select('*')
      
      filters.forEach(filter => {
        query = query.filter(filter.column as string, filter.operator, filter.value)
      })
      
      const { data: existingData, error: fetchError } = await query
      
      if (fetchError) {
        return { success: false, data: null, error: fetchError }
      }
      
      if (!existingData || existingData.length === 0) {
        return { 
          success: false, 
          data: null, 
          error: new Error(`No records found with the provided filters`) 
        }
      }
      
      // Maintenant supprimer avec les mêmes filtres
      let deleteQuery = client.from(this.tableName).delete()
      
      filters.forEach(filter => {
        deleteQuery = deleteQuery.filter(filter.column as string, filter.operator, filter.value)
      })
      
      const { error: deleteError } = await deleteQuery
      
      if (deleteError) {
        return { success: false, data: null, error: deleteError }
      }
      
      return { success: true, data: existingData as T[], error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }

  /**
   * Compte le nombre d'enregistrements (optionnellement avec des filtres)
   */
  async count(filters?: FilterOptions<T>[]): Promise<CrudResult<number>> {
    try {
      const client = await this.getClient()
      
      let query = client.from(this.tableName).select('*', { count: 'exact', head: true })
      
      if (filters) {
        filters.forEach(filter => {
          query = query.filter(filter.column as string, filter.operator, filter.value)
        })
      }
      
      const { count, error } = await query
      
      if (error) {
        return { success: false, data: null, error }
      }
      
      return { success: true, data: count || 0, error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }

  /**
   * Vérifie si un enregistrement existe
   */
  async exists(id: T[K]): Promise<CrudResult<boolean>> {
    try {
      const result = await this.getById(id)
      return { 
        success: result.success, 
        data: !!result.data, 
        error: result.error 
      }
    } catch (err) {
      return { success: false, data: false, error: err as Error }
    }
  }

  /**
   * Exécute une requête RPC personnalisée
   */
  async rpc(
    functionName: string,
    params?: Record<string, any>
  ): Promise<CrudResult<any>> {
    try {
      const client = await this.getClient()
      
      const { data, error } = await client.rpc(functionName, params || {})
      
      if (error) {
        return { success: false, data: null, error }
      }
      
      return { success: true, data, error: null }
    } catch (err) {
      return { success: false, data: null, error: err as Error }
    }
  }
}

/**
 * Fonction utilitaire pour créer un service CRUD côté client
 */
export function createClientCrud<T extends Record<string, any>, K extends keyof T = 'id'>(
  tableName: string,
  primaryKey: K = 'id' as K
) {
  return new SupabaseCrud<T, K>(tableName, primaryKey, 'client')
}

/**
 * Fonction utilitaire pour créer un service CRUD côté serveur
 */
export function createServerCrud<T extends Record<string, any>, K extends keyof T = 'id'>(
  tableName: string,
  primaryKey: K = 'id' as K
) {
  return new SupabaseCrud<T, K>(tableName, primaryKey, 'server')
}

/**
 * Type utilitaire pour créer une interface de table Supabase
 * 
 * @example
 * ```typescript
 * // Utilisation dans votre code
 * type User = {
 *   id: string
 *   name: string
 *   email: string
 * }
 * 
 * type UserTable = SupabaseTableType<User>
 * const userCrud = new SupabaseCrud<UserTable>('users')
 * ```
 */
export type SupabaseTableType<T> = T & {
  created_at?: string
  updated_at?: string
}

export default SupabaseCrud