/**
 * Point d'entrée principal pour toutes les fonctionnalités Supabase
 * 
 * Ce fichier exporte tout ce dont vous avez besoin pour utiliser le CRUD générique
 * et les outils Supabase dans votre application.
 */

// CRUD principal
export { 
  SupabaseCrud,
  createClientCrud,
  createServerCrud
} from './supabase-crud'

// Types depuis supabase-crud
export type {
  FilterOptions,
  SortOptions,
  PaginationOptions,
  SelectOptions,
  GetOptions,
  PaginatedResult,
  CrudResult,
  SupabaseTableType
} from './supabase-crud'

// Types utilitaires depuis supabase-types
export type {
  WithTimestamps,
  WithUUID,
  WithAutoIncrementID,
  WithAuditFields,
  WithSoftDelete,
  SupabaseOperator,
  SelectQueryOptions,
  UpsertOptions,
  DatabaseResult,
  JoinOptions,
  AggregateOptions,
  AggregateResult,
  BaseUser,
  UserSession,
  Permission,
  AuditLog,
  QueryState,
  MutationState,
  CRUDHookResult
} from './supabase-types'

// Constructeurs de filtres depuis supabase-types
export {
  eqFilter,
  neqFilter,
  gtFilter,
  gteFilter,
  ltFilter,
  lteFilter,
  likeFilter,
  ilikeFilter,
  startsWithFilter,
  inFilter,
  isNullFilter,
  isNotNullFilter,
  newestFirst,
  oldestFirst
} from './supabase-types'

// Constructeurs de filtres simplifiés depuis supabase-crud.example
export {
  eq,
  neq,
  gt,
  gte,
  lt,
  lte,
  like,
  ilike,
  inFilter as in
} from './supabase-crud.example'

// Options de pagination
export {
  DEFAULT_PAGINATION,
  LONG_LIST_PAGINATION,
  EXPORT_PAGINATION
} from './supabase-types'

// Utilitaires pour les résultats depuis supabase-types
export {
  isSuccess,
  isError,
  getData,
  getDataOrNull,
  getDataOrDefault
} from './supabase-types'

// Utilitaires pour les résultats depuis supabase-crud.example
export { handleCrudResult } from './supabase-crud.example'

// Clients Supabase
export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient } from './server'

// Types pour les clients
export type { SupabaseClient } from '@supabase/supabase-js'