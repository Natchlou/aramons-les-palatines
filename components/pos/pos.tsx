"use client"

import { useState } from "react"

import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import PosCart from "./pos-cart"
import PosProducts from "./pos-products"

import type {
    CartItem,
    Product,
} from "./types"

import {
    Coffee,
    GlassWater,
    CakeSlice,
} from "lucide-react"

const products: Product[] = [
    {
        id: "menu",
        name: "Menu classique",
        price: 12.5,
        icon: CakeSlice
    },
    {
        id: "cafe",
        name: "Café",
        price: 1.5,
        icon: Coffee 
    },
    {
        id: 'champagne',
        name: 'Coupe de champagne',
        price: 5.5,
        icon: GlassWater
    }
]

export default function Pos() {
    const [cart, setCart] = useState<CartItem[]>([])

    const addToCart = (product: Product) => {
        setCart((currentCart) => {
            const existingItem = currentCart.find(
                (item) => item.id === product.id,
            )

            if (existingItem) {
                return currentCart.map((item) =>
                    item.id === product.id
                        ? {
                            ...item,
                            quantity: item.quantity + 1,
                        }
                        : item,
                )
            }

            return [
                ...currentCart,
                {
                    ...product,
                    quantity: 1,
                },
            ]
        })
    }

    const increaseQuantity = (productId: string) => {
        setCart((currentCart) =>
            currentCart.map((item) =>
                item.id === productId
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                    }
                    : item,
            ),
        )
    }

    const decreaseQuantity = (productId: string) => {
        setCart((currentCart) =>
            currentCart
                .map((item) =>
                    item.id === productId
                        ? {
                            ...item,
                            quantity: item.quantity - 1,
                        }
                        : item,
                )
                .filter((item) => item.quantity > 0),
        )
    }

    const removeFromCart = (productId: string) => {
        setCart((currentCart) =>
            currentCart.filter(
                (item) => item.id !== productId,
            ),
        )
    }

    const clearCart = () => {
        setCart([])
    }

    const submit = () => {
        if(confirm('Vous voulez enregistrer cette transaction ?')){
            alert('Transaction enregistrée avec succès !')
            clearCart()
        } else {
            alert('Transaction annulée !')
        }
    }

    return (
        <div className="flex h-dvh flex-col overflow-hidden bg-muted/20 select-none">
            <main className="min-h-0 flex-1">
                <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_400px]">
                    <section className="min-h-0 overflow-y-auto p-4 lg:p-6">
                        <div className="mx-auto max-w-6xl space-y-5">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    Restaurant
                                </h1>
                            </div>

                            <Separator />

                            <PosProducts
                                products={products}
                                onAdd={addToCart}
                            />
                        </div>
                    </section>

                    <Card className="min-h-0 rounded-none border-y-0 border-r-0 lg:rounded-none">
                        <div className="h-full p-4 lg:p-6">
                            <PosCart
                                items={cart}
                                onIncrease={increaseQuantity}
                                onDecrease={decreaseQuantity}
                                onRemove={removeFromCart}
                                onClear={clearCart}
                                onSubmit={submit}
                            />
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}