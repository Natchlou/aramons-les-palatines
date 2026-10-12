"use client"

import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import type { Product } from "./types"

type PosProductsProps = {
    products: Product[]
    onAdd: (product: Product) => void
}

const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
})

export default function PosProducts({
    products,
    onAdd,
}: PosProductsProps) {
    if (products.length === 0) {
        return (
            <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed">
                <p className="text-sm text-muted-foreground">
                    Aucun produit trouvé.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
                const Icon = product.icon
                return (<Card
                    key={product.id}
                    className="group overflow-hidden transition-colors hover:border-primary/50"
                >
                    <CardContent className="p-0">
                        <div className="flex aspect-square items-center justify-center bg-muted/40">
                            <Icon className="size-30" strokeWidth={1.8} />
                        </div>

                        <div className="space-y-3 p-3">
                            <div>
                                <p className="truncate font-medium">
                                    {product.name}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    {formatter.format(product.price)}
                                </p>
                            </div>

                            <Button
                                className="w-full"
                                size="sm"
                                onClick={() => onAdd(product)}
                            >
                                <PlusIcon />
                                Ajouter
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                )
            })}
        </div>
    )
}