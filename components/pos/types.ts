import type { LucideIcon } from "lucide-react"

export type Product = {
    id: string
    name: string
    price: number
    icon: LucideIcon
}

export type CartItem = Product & {
    quantity: number
}