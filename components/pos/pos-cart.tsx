"use client"

import { useMemo } from "react"
import {
    MinusIcon,
    PlusIcon,
    ShoppingCartIcon,
    Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import type { CartItem } from "./types"

type PosCartProps = {
    items: CartItem[]
    onIncrease: (productId: string) => void
    onDecrease: (productId: string) => void
    onRemove: (productId: string) => void
    onClear: () => void
    onSubmit: () => void
}

const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
})

const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
    }).format(priceInCents / 100)
}

export default function PosCart({
    items,
    onIncrease,
    onDecrease,
    onRemove,
    onClear,
    onSubmit,
}: PosCartProps) {
    const { total, itemCount } = useMemo(() => {
        return items.reduce(
            (acc, item) => {
                acc.total += item.price * item.quantity
                acc.itemCount += item.quantity

                return acc
            },
            {
                total: 0,
                itemCount: 0,
            },
        )
    }, [items])

    return (
        <aside className="flex h-full min-h-0 flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShoppingCartIcon className="size-5" />

                    <h2 className="font-semibold">
                        Panier
                    </h2>

                    {itemCount > 0 && (
                        <span className="text-sm text-muted-foreground">
                            ({itemCount})
                        </span>
                    )}
                </div>

                {items.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                    >
                        Vider
                    </Button>
                )}
            </div>

            <Separator className="my-4" />

            {/* Cart */}
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
                {items.length === 0 ? (
                    <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                            <ShoppingCartIcon className="size-5 text-muted-foreground" />
                        </div>

                        <p className="font-medium">
                            Votre panier est vide
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Ajoutez des produits pour commencer.
                        </p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-xl border bg-background p-3"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate font-medium">
                                        {item.name}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {formatPrice(item.price)}
                                    </p>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => onRemove(item.id)}
                                >
                                    <Trash2Icon />
                                </Button>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center rounded-xl border">
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() =>
                                            onDecrease(item.id)
                                        }
                                    >
                                        <MinusIcon />
                                    </Button>

                                    <span className="w-8 text-center text-sm font-medium">
                                        {item.quantity}
                                    </span>

                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() =>
                                            onIncrease(item.id)
                                        }
                                    >
                                        <PlusIcon />
                                    </Button>
                                </div>

                                <span className="font-semibold">
                                    {formatPrice(
                                        item.price * item.quantity,
                                    )}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Total */}
            <div className="mt-4 space-y-4 border-t pt-4">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Total
                        </p>

                        <p className="text-3xl font-bold tracking-tight">
                            {formatPrice(total)}
                        </p>
                    </div>

                    {itemCount > 0 && (
                        <span className="pb-1 text-sm text-muted-foreground">
                            {itemCount} article
                            {itemCount > 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                <Button
                    size="lg"
                    className="h-14 w-full rounded-xl text-base font-semibold"
                    disabled={items.length === 0}
                    onClick={onSubmit}
                >
                    Enregistrer {formatPrice(total)}
                </Button>
            </div>
        </aside>
    )
}