/**
 * Types utilitaires et interfaces pour Supabase
 * 
 * Ce fichier contient des types TypeScript supplémentaires pour améliorer
 * l'expérience de développement avec le CRUD générique Supabase.
 */

import { 
  FilterOptions, 
  SortOptions, 
  PaginationOptions, 
  PaginatedResult,
  CrudResult,
  SupabaseTableType 
} from './supabase-crud'

// ============================================================================
// Types de base pour Supabase
// ============================================================================

/**
 * Type générique pour les tables avec timestamps
 */
export interface WithTimestamps {
  created_at?: string
  updated_at?: string
}

/**
 * Type générique pour les tables avec ID UUID
 */
export interface WithUUID {
  id: string
}

/**
 * Type générique pour les tables avec ID auto-incrémenté
 */
export interface WithAutoIncrementID {
  id: number
}

/**
 * Type pour les tables avec des champs d'audit
 */
export interface WithAuditFields {
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
}

/**
 * Type pour les soft deletes
 */
export interface WithSoftDelete {
  deleted_at?: string | null
  is_deleted?: boolean
}

// ============================================================================
// Types pour les opérations de base de données
// ============================================================================

/**
 * Opérateurs de comparaison pour les requêtes Supabase
 */
export type SupabaseOperator = 
  | 'eq'      // Égal à
  | 'neq'     // Différent de
  | 'gt'      // Supérieur à
  | 'gte'     // Supérieur ou égal à
  | 'lt'      // Inférieur à
  | 'lte'     // Inférieur ou égal à
  | 'like'    // Contient (sensible à la casse)
  | 'ilike'   // Contient (insensible à la casse)
  | 'is'      // Est null
  | 'in'      // Dans la liste
  | 'contains'  // Contient (pour les types JSON/array)
  | 'contained' // Est contenu dans (pour les types JSON/array)
  | 'range'   // Dans la plage (pour les types range)

/**
 * Options pour les requêtes de sélection
 */
export interface SelectQueryOptions<T> {
  columns?: (keyof T)[]
  head?: boolean
  count?: 'exact' | 'planned' | 'estimated' | null
}

/**
 * Options pour les opérations d'upsert
 */
export interface UpsertOptions {
  onConflict?: string | string[]
  ignoreDuplicates?: boolean
}

/**
 * Résultat des opérations de base de données
 */
export interface DatabaseResult<T> {
  data: T | null
  error: Error | null
  status: number
  statusText: string
}

// ============================================================================
// Types pour les requêtes avancées
// ============================================================================

/**
 * Options pour les requêtes de jointure
 */
export interface JoinOptions<T, U> {
  foreignTable: string
  joinColumn: keyof T
  foreignColumn: keyof U
  joinType?: 'inner' | 'left' | 'right' | 'full'
}

/**
 * Options pour les requêtes agrégées
 */
export interface AggregateOptions<T> {
  groupBy?: (keyof T)[]
  count?: boolean | string
  sum?: (keyof T)[]
  avg?: (keyof T)[]
  min?: (keyof T)[]
  max?: (keyof T)[]
}

/**
 * Résultat des opérations agrégées
 */
export interface AggregateResult<T> {
  groups: Record<string, any>[]
  counts: Record<string, number>
  sums: Record<string, number>
  avgs: Record<string, number>
  mins: Record<string, any>
  maxs: Record<string, any>
}

// ============================================================================
// Types pour les tables courantes
// ============================================================================

/**
 * Interface de base pour un utilisateur
 */
export interface BaseUser extends WithTimestamps, WithUUID {
  email: string
  name?: string
  avatar_url?: string
  role: string
  phone?: string
}

/**
 * Interface pour les sessions utilisateur
 */
export interface UserSession extends WithTimestamps {
  id: string
  user_id: string
  access_token: string
  refresh_token?: string
  expires_at: string
  ip_address?: string
  user_agent?: string
}

/**
 * Interface pour les permissions
 */
export interface Permission {
  id: string
  role: string
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'manage'
  created_at?: string
}

/**
 * Interface pour les audits/logs
 */
export interface AuditLog extends WithTimestamps, WithUUID {
  user_id?: string
  action: string
  table_name?: string
  record_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
}

// ============================================================================
// Constructeurs de filtres
// ============================================================================

/**
 * Crée un filtre « égal à »
 */
export function eqFilter<T>(column: keyof T, value: any): FilterOptions<T> {
  return { column, operator: 'eq', value }
}

/**
 * Crée un filtre « différent de »
 */
export function neqFilter<T>(column: keyof T, value: any): FilterOptions<T> {
  return { column, operator: 'neq', value }
}

/**
 * Crée un filtre « supérieur à »
 */
export function gtFilter<T>(column: keyof T, value: any): FilterOptions<T> {
  return { column, operator: 'gt', value }
}

/**
 * Crée un filtre « supérieur ou égal à »
 */
export function gteFilter<T>(column: keyof T, value: any): FilterOptions<T> {
  return { column, operator: 'gte', value }
}

/**
 * Crée un filtre « inférieur à »
 */
export function ltFilter<T>(column: keyof T, value: any): FilterOptions<T> {
  return { column, operator: 'lt', value }
}

/**
 * Crée un filtre « inférieur ou égal à »
 */
export function lteFilter<T>(column: keyof T, value: any): FilterOptions<T> {
  return { column, operator: 'lte', value }
}

/**
 * Crée un filtre « contient » (sensible à la casse)
 */
export function likeFilter<T>(column: keyof T, value: string): FilterOptions<T> {
  return { column, operator: 'like', value: `%${value}%` }
}

/**
 * Crée un filtre « contient » (insensible à la casse)
 */
export function ilikeFilter<T>(column: keyof T, value: string): FilterOptions<T> {
  return { column, operator: 'ilike', value: `%${value}%` }
}

/**
 * Crée un filtre « commence par » (insensible à la casse)
 */
export function startsWithFilter<T>(column: keyof T, value: string): FilterOptions<T> {
  return { column, operator: 'ilike', value: `${value}%` }
}

/**
 * Crée un filtre « dans la liste »
 */
export function inFilter<T>(column: keyof T, values: any[]): FilterOptions<T> {
  return { column, operator: 'in', value: `(${values.join(',')})` }
}

/**
 * Crée un filtre « est null »
 */
export function isNullFilter<T>(column: keyof T): FilterOptions<T> {
  return { column, operator: 'is', value: null }
}

/**
 * Crée un filtre « n'est pas null »
 */
export function isNotNullFilter<T>(column: keyof T): FilterOptions<T> {
  return { column, operator: 'neq', value: null }
}

// ============================================================================
// Constructeurs de tri
// ============================================================================

/**
 * Crée un tri croissant
 */
export function ascendingSort<T>(column: keyof T): SortOptions<T> {
  return { column, ascending: true }
}

/**
 * Crée un tri décroissant
 */
export function descendingSort<T>(column: keyof T): SortOptions<T> {
  return { column, ascending: false }
}

/**
 * Crée un tri par date de création (plus récent d'abord)
 */
export function newestFirst<T extends WithTimestamps>(): SortOptions<T> {
  return { column: 'created_at', ascending: false }
}

/**
 * Crée un tri par date de création (plus ancien d'abord)
 */
export function oldestFirst<T extends WithTimestamps>(): SortOptions<T> {
  return { column: 'created_at', ascending: true }
}

// ============================================================================
// Options de pagination
// ============================================================================

/**
 * Options de pagination par défaut
 */
export const DEFAULT_PAGINATION: PaginationOptions = {
  page: 1,
  pageSize: 10
}

/**
 * Options de pagination pour les listes longues
 */
export const LONG_LIST_PAGINATION: PaginationOptions = {
  page: 1,
  pageSize: 50
}

/**
 * Options de pagination pour les exports
 */
export const EXPORT_PAGINATION: PaginationOptions = {
  page: 1,
  pageSize: 1000
}

// ============================================================================
// Fonctions utilitaires pour les résultats
// ============================================================================

/**
 * Vérifie si un résultat CRUD est réussi
 */
export function isSuccess<T>(result: CrudResult<T>): result is { success: true; data: T; error: null } {
  return result.success
}

/**
 * Vérifie si un résultat CRUD a échoué
 */
export function isError<T>(result: CrudResult<T>): result is { success: false; data: null; error: Error } {
  return !result.success
}

/**
 * Extrait les données d'un résultat CRUD réussi
 */
export function getData<T>(result: CrudResult<T>): T {
  if (!result.success) {
    throw result.error
  }
  return result.data as T
}

/**
 * Extrait les données ou retourne null si échec
 */
export function getDataOrNull<T>(result: CrudResult<T>): T | null {
  return result.success ? result.data as T : null
}

/**
 * Extrait les données ou retourne une valeur par défaut
 */
export function getDataOrDefault<T>(result: CrudResult<T>, defaultValue: T): T {
  return result.success ? result.data as T : defaultValue
}

// ============================================================================
// Types pour les hooks React
// ============================================================================

/**
 * État pour les hooks useQuery personnalisés
 */
export interface QueryState<T> {
  data: T | null
  error: Error | null
  loading: boolean
  loaded: boolean
}

/**
 * État pour les hooks useMutation personnalisés
 */
export interface MutationState<T> {
  data: T | null
  error: Error | null
  loading: boolean
  success: boolean
}

/**
 * Résultat des hooks useCRUD personnalisés
 */
export interface CRUDHookResult<T, K extends keyof T = any> {
  // lecture
  getAll: QueryState<T[]>
  getById: (id: T[K]) => QueryState<T | null>
  getWithFilters: (options: { filters?: FilterOptions<T>[]; sort?: SortOptions<T>[]; pagination?: PaginationOptions }) => QueryState<T[]>
  getPaginated: (options: { pagination: PaginationOptions; filters?: FilterOptions<T>[]; sort?: SortOptions<T>[] }) => QueryState<PaginatedResult<T>>
  
  // écriture
  create: (item: Omit<T, K>) => MutationState<T>
  update: (id: T[K], updates: Partial<T>) => MutationState<T>
  delete: (id: T[K]) => MutationState<T>
  
  // utilitaires
  count: QueryState<number>
  exists: (id: T[K]) => QueryState<boolean>
  
  // rechargement
  refetchAll: () => Promise<void>
  refetchById: (id: T[K]) => Promise<void>
}

// ============================================================================
// Export des types du CRUD principal
// ============================================================================

export type { 
  FilterOptions,
  SortOptions,
  PaginationOptions,
  PaginatedResult,
  CrudResult,
  SupabaseTableType
} from './supabase-crud'