/**
 * Exemples d'utilisation du CRUD générique Supabase
 * 
 * Ce fichier montre comment utiliser la classe SupabaseCrud avec différentes tables
 */

import { 
  SupabaseCrud, 
  createClientCrud, 
  createServerCrud,
  FilterOptions,
  SortOptions,
  PaginatedResult,
  CrudResult
} from './supabase-crud'

// ============================================================================
// EXEMPLE 1: Gestion des utilisateurs
// ============================================================================

/**
 * Définir l'interface pour la table users
 */
interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  role: 'admin' | 'user' | 'guest'
  created_at?: string
  updated_at?: string
}

// Créer un service CRUD pour les utilisateurs (côté client)
const userCrud = new SupabaseCrud<User>('users')

// Exemples d'utilisation:

// Récupérer tous les utilisateurs
async function getAllUsers() {
  const result: CrudResult<User[]> = await userCrud.getAll()
  
  if (result.success) {
    console.log('Utilisateurs:', result.data)
    return result.data
  } else {
    console.error('Erreur:', result.error)
    throw result.error
  }
}

// Récupérer un utilisateur par son ID
async function getUserById(userId: string) {
  const result: CrudResult<User | null> = await userCrud.getById(userId)
  
  if (result.success) {
    return result.data
  } else {
    console.error('Erreur:', result.error)
    return null
  }
}

// Créer un nouvel utilisateur
async function createUser(newUser: Omit<User, 'id'>) {
  const result: CrudResult<User> = await userCrud.create({
    email: newUser.email,
    name: newUser.name,
    role: newUser.role || 'user'
  })
  
  if (result.success) {
    console.log('Utilisateur créé:', result.data)
    return result.data
  } else {
    console.error('Erreur:', result.error)
    throw result.error
  }
}

// Mettre à jour un utilisateur
async function updateUser(userId: string, updates: Partial<User>) {
  const result: CrudResult<User> = await userCrud.update(userId, updates)
  
  if (result.success) {
    console.log('Utilisateur mis à jour:', result.data)
    return result.data
  } else {
    console.error('Erreur:', result.error)
    throw result.error
  }
}

// Supprimer un utilisateur
async function deleteUser(userId: string) {
  const result: CrudResult<User> = await userCrud.delete(userId)
  
  if (result.success) {
    console.log('Utilisateur supprimé:', result.data)
    return true
  } else {
    console.error('Erreur:', result.error)
    return false
  }
}

// ============================================================================
// EXEMPLE 2: Gestion des produits avec des filtres
// ============================================================================

interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  category: string
  active: boolean
  created_at?: string
}

const productCrud = new SupabaseCrud<Product>('products')

// Récupérer des produits avec des filtres
async function getActiveProductsByCategory(category: string) {
  const filters: FilterOptions<Product>[] = [
    { column: 'active', operator: 'eq', value: true },
    { column: 'category', operator: 'eq', value: category }
  ]
  
  const result: CrudResult<Product[]> = await productCrud.getWithFilters({
    filters,
    sort: [{ column: 'price', ascending: true }] // Trier par prix croissant
  })
  
  return result.success ? result.data : []
}

// Récupérer des produits en stock
async function getInStockProducts() {
  const filters: FilterOptions<Product>[] = [
    { column: 'stock', operator: 'gt', value: 0 }
  ]
  
  const result: CrudResult<Product[]> = await productCrud.getWithFilters({ filters })
  
  return result.success ? result.data : []
}

// ============================================================================
// EXEMPLE 3: Gestion des commandes avec pagination
// ============================================================================

interface Order {
  id: string
  user_id: string
  total_amount: number
  status: 'pending' | 'completed' | 'cancelled' | 'shipped'
  created_at?: string
}

const orderCrud = new SupabaseCrud<Order>('orders')

// Récupérer les commandes avec pagination
async function getOrdersPaginated(page: number = 1, pageSize: number = 10) {
  const result: CrudResult<PaginatedResult<Order>> = await orderCrud.getAllPaginated(
    { page, pageSize },
    {
      sort: [{ column: 'created_at', ascending: false }], // Plus récentes d'abord
      filters: [{ column: 'status', operator: 'neq', value: 'cancelled' }]
    }
  )
  
  if (result.success && result.data) {
    const paginatedResult = result.data as PaginatedResult<Order>
    console.log(`Page ${paginatedResult.page}/${paginatedResult.totalPages}`)
    console.log('Commandes:', paginatedResult.data)
    console.log(`Total: ${paginatedResult.count} commandes`)
    console.log(`Has next: ${paginatedResult.hasNextPage}`)
    return paginatedResult
  } else {
    console.error('Erreur:', result.error)
    return null
  }
}

// ============================================================================
// EXEMPLE 4: Utilisation côté serveur
// ============================================================================

// Créer un service CRUD côté serveur
const serverUserCrud = new SupabaseCrud<User>('users', 'id', 'server')

// Utilisation dans un Server Component ou API Route
async function getServerUser(userId: string) {
  // Ce client fonctionnera avec l'authentification côté serveur
  const result: CrudResult<User | null> = await serverUserCrud.getById(userId)
  
  if (result.success) {
    return result.data
  } else {
    console.error('Erreur côté serveur:', result.error)
    return null
  }
}

// ============================================================================
// EXEMPLE 5: Utilisation des fonctions utilitaires
// ============================================================================

// Créer rapidement un service client
const quickClientCrud = createClientCrud<User>('users')

// Créer rapidement un service serveur
const quickServerCrud = createServerCrud<Product>('products')

// ============================================================================
// EXEMPLE 6: Opérations batch
// ============================================================================

// Créer plusieurs produits en une seule requête
async function createMultipleProducts(products: Omit<Product, 'id'>[]) {
  const result: CrudResult<Product[]> = await productCrud.createMany(products)
  
  if (result.success) {
    console.log('Produits créés:', result.data)
    return result.data
  } else {
    console.error('Erreur:', result.error)
    return []
  }
}

// Supprimer plusieurs produits par leurs IDs
async function deleteMultipleProducts(productIds: string[]) {
  const result: CrudResult<Product[]> = await productCrud.deleteMany(productIds)
  
  if (result.success) {
    console.log('Produits supprimés:', result.data)
    return true
  } else {
    console.error('Erreur:', result.error)
    return false
  }
}

// ============================================================================
// EXEMPLE 7: Compter les enregistrements
// ============================================================================

// Compter le nombre total d'utilisateurs
async function countUsers() {
  const result: CrudResult<number> = await userCrud.count()
  
  if (result.success) {
    console.log('Nombre total d\'utilisateurs:', result.data)
    return result.data
  } else {
    console.error('Erreur:', result.error)
    return 0
  }
}

// Compter les utilisateurs avec un rôle spécifique
async function countUsersByRole(role: User['role']) {
  const filters: FilterOptions<User>[] = [
    { column: 'role', operator: 'eq', value: role }
  ]
  
  const result: CrudResult<number> = await userCrud.count(filters)
  
  if (result.success) {
    console.log(`Nombre d\'utilisateurs avec rôle ${role}:`, result.data)
    return result.data
  } else {
    console.error('Erreur:', result.error)
    return 0
  }
}

// ============================================================================
// EXEMPLE 8: Vérifier l'existence
// ============================================================================

// Vérifier si un produit existe
async function productExists(productId: string) {
  const result: CrudResult<boolean> = await productCrud.exists(productId)
  
  if (result.success) {
    console.log(`Le produit ${productId} existe:`, result.data)
    return result.data
  } else {
    console.error('Erreur:', result.error)
    return false
  }
}

// ============================================================================
// EXEMPLE 9: Opérations avancées avec filtres complexes
// ============================================================================

// Récupérer les produits avec un prix dans une plage
async function getProductsByPriceRange(minPrice: number, maxPrice: number) {
  const filters: FilterOptions<Product>[] = [
    { column: 'price', operator: 'gte', value: minPrice },
    { column: 'price', operator: 'lte', value: maxPrice }
  ]
  
  const result: CrudResult<Product[]> = await productCrud.getWithFilters({
    filters,
    sort: [{ column: 'price', ascending: true }]
  })
  
  return result.success ? result.data : []
}

// Rechercher des produits par nom
async function searchProductsByName(query: string) {
  const filters: FilterOptions<Product>[] = [
    { column: 'name', operator: 'ilike', value: `%${query}%` }
  ]
  
  const result: CrudResult<Product[]> = await productCrud.getWithFilters({ filters })
  
  return result.success ? result.data : []
}

// ============================================================================
// EXEMPLE 10: Utilisation avec TypeScript - Sécurité des types
// ============================================================================

// Définir une interface avec des clés primaires différentes
interface Reservation {
  reservation_id: string  // Clé primaire différente de 'id'
  user_id: string
  room_id: string
  check_in: string
  check_out: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

// Créer un service CRUD avec une clé primaire personnalisée
const reservationCrud = new SupabaseCrud<Reservation, 'reservation_id'>(
  'reservations',
  'reservation_id'
)

// Utilisation avec la bonne clé primaire
async function getReservation(reservationId: string) {
  // reservationId est automatiquement typé comme Reservation['reservation_id']
  const result: CrudResult<Reservation | null> = await reservationCrud.getById(reservationId)
  return result.success ? result.data : null
}

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