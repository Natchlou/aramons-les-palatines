/**
 * Exemples d'utilisation du CRUD générique Supabase
 * 
 * Ce fichier montre comment utiliser la classe SupabaseCrud avec différentes tables
 */

import { 
  FilterOptions,
  SortOptions,
  CrudResult
} from './supabase-crud'

// ============================================================================
// UTILITAIRES
// ============================================================================

// Fonction utilitaire pour gérer les résultats CRUD de manière cohérente
export async function handleCrudResult<T>(
  crudResult: CrudResult<T>,
  successMessage?: string,
  errorMessage?: string
): Promise<T | null> {
  if (crudResult.success) {
    if (successMessage) {
      console.log(successMessage)
    }
    return crudResult.data as T
  } else {
    if (errorMessage) {
      console.error(errorMessage, crudResult.error)
    }
    return null
  }
}

// Fonction utilitaire pour les opérateurs de filtre couramment utilisés
export function eq<T>(column: keyof T, value: any): FilterOptions<T> {
  return { column, operator: 'eq', value }
}

export function neq<T>(column: keyof T, value: any): FilterOptions<T> {
  return { column, operator: 'neq', value }
}

export function gt<T>(column: keyof T, value: any): FilterOptions<T> {
  return { column, operator: 'gt', value }
}

export function gte<T>(column: keyof T, value: any): FilterOptions<T> {
  return { column, operator: 'gte', value }
}

export function lt<T>(column: keyof T, value: any): FilterOptions<T> {
  return { column, operator: 'lt', value }
}

export function lte<T>(column: keyof T, value: any): FilterOptions<T> {
  return { column, operator: 'lte', value }
}

export function like<T>(column: keyof T, value: any): FilterOptions<T> {
  return { column, operator: 'like', value }
}

export function ilike<T>(column: keyof T, value: any): FilterOptions<T> {
  return { column, operator: 'ilike', value }
}

export function inFilter<T>(column: keyof T, values: any[]): FilterOptions<T> {
  return { column, operator: 'in', value: values }
}

export function ascending<T>(column: keyof T): SortOptions<T> {
  return { column, ascending: true }
}

export function descending<T>(column: keyof T): SortOptions<T> {
  return { column, ascending: false }
}