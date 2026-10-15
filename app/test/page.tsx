
"use client"

import { useState } from "react"

import { Checkbox } from "@/components/ui/checkbox"
import {
    Field,
    FieldContent,
    FieldGroup,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field"

const MENU_PRICE = 1250
const CAFE_PRICE = 150
const RESIDENT_COUNT = 52

type Order = {
    menu: boolean
    cafe: boolean
}

const residents = Array.from(
    { length: RESIDENT_COUNT },
    (_, index) => ({
        id: index + 1,
        name: index === 0 ? "Mme BENAVENTE" : `Résident ${index + 1}`,
    }),
)

const formatPrice = (cents: number) =>
    new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
    }).format(cents / 100)

export default function TestPage() {
    const [orders, setOrders] = useState<Record<number, Order>>({})

    function updateOrder(
        residentId: number,
        item: keyof Order,
        checked: boolean,
    ) {
        setOrders((current) => ({
            ...current,
            [residentId]: {
                menu: current[residentId]?.menu ?? false,
                cafe: current[residentId]?.cafe ?? false,
                [item]: checked,
            },
        }))
    }

    const menuCount = Object.values(orders).filter(
        (order) => order.menu,
    ).length

    const cafeCount = Object.values(orders).filter(
        (order) => order.cafe,
    ).length

    const servedCount = Object.values(orders).filter(
        (order) => order.menu || order.cafe,
    ).length

    const total = menuCount * MENU_PRICE + cafeCount * CAFE_PRICE

    const selectedResidents = residents.filter((resident) => {
        const order = orders[resident.id]
        return order?.menu || order?.cafe
    })

    function resetOrders() {
        setOrders({})
    }


    function setAllItems(item: keyof Order, checked: boolean) {
        setOrders((current) => {
            const next = { ...current }

            residents.forEach((resident) => {
                next[resident.id] = {
                    menu: current[resident.id]?.menu ?? false,
                    cafe: current[resident.id]?.cafe ?? false,
                    [item]: checked,
                }
            })

            return next
        })
    }

    function setAllOrders(checked: boolean) {
        setOrders(
            Object.fromEntries(
                residents.map((resident) => [
                    resident.id,
                    { menu: checked, cafe: checked },
                ]),
            ),
        )
    }


    return (
        <div className="min-h-screen bg-muted/30">
            <header className="bg-primary p-4 text-primary-foreground">
                <h1 className="text-2xl font-bold">Restaurant</h1>
                <p className="text-sm opacity-80">
                    Gestion des commandes résidents
                </p>
            </header>

            <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <main className="grid grid-cols-2 content-start gap-3 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5">
                    {residents.map((resident) => (
                        <ResidentCard
                            key={resident.id}
                            id={resident.id}
                            name={resident.name}
                            order={orders[resident.id] ?? {
                                menu: false,
                                cafe: false,
                            }}
                            onChange={(item, checked) =>
                                updateOrder(resident.id, item, checked)
                            }
                        />
                    ))}
                </main>

                <aside className="h-fit rounded-xl border bg-background p-4 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
                            <span className="text-xl">€</span>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">
                                Récapitulatif
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Commandes du service
                            </p>
                        </div>
                    </div>

                    <div className="mb-5 space-y-2">
                        <h3 className="text-sm font-semibold">Actions rapides</h3>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setAllItems("menu", true)}
                                className="flex items-center justify-center gap-2 rounded-lg border p-2.5 text-sm font-medium transition-colors hover:bg-muted"
                            >
                                <span>🍽️</span>
                                Tous les menus
                            </button>

                            <button
                                type="button"
                                onClick={() => setAllItems("cafe", true)}
                                className="flex items-center justify-center gap-2 rounded-lg border p-2.5 text-sm font-medium transition-colors hover:bg-muted"
                            >
                                <span>☕</span>
                                Tous les cafés
                            </button>

                            <button
                                type="button"
                                onClick={() => setAllOrders(true)}
                                className="col-span-2 rounded-lg bg-primary p-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                            >
                                Tout sélectionner
                            </button>

                            <button
                                type="button"
                                onClick={() => setAllOrders(false)}
                                className="col-span-2 rounded-lg border p-2.5 text-sm font-medium transition-colors hover:bg-muted"
                            >
                                Tout décocher
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">
                                Menus
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {menuCount}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {formatPrice(MENU_PRICE)} / unité
                            </p>
                        </div>

                        <div className="rounded-lg border p-3">
                            <p className="text-sm text-muted-foreground">
                                Cafés
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {cafeCount}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {formatPrice(CAFE_PRICE)} / unité
                            </p>
                        </div>
                    </div>

                    <div className="my-5">
                        <div className="mb-2 flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Résidents servis
                            </span>
                            <span className="font-semibold">
                                {servedCount} / {RESIDENT_COUNT}
                            </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{
                                    width: `${(servedCount / RESIDENT_COUNT) * 100}%`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold">
                            Détail des commandes
                        </h3>

                        {selectedResidents.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-5 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Aucune commande pour le moment.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {selectedResidents.map((resident) => {
                                    const order = orders[resident.id]

                                    const residentTotal =
                                        (order.menu ? MENU_PRICE : 0) +
                                        (order.cafe ? CAFE_PRICE : 0)

                                    return (
                                        <div
                                            key={resident.id}
                                            className="flex items-start justify-between gap-3 py-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {resident.name}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {[
                                                        order.menu && "Menu",
                                                        order.cafe && "Café",
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" · ")}
                                                </p>
                                            </div>

                                            <p className="shrink-0 text-sm font-semibold">
                                                {formatPrice(residentTotal)}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 space-y-3 border-t pt-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Sous-total menus
                            </span>
                            <span>{formatPrice(menuCount * MENU_PRICE)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Sous-total cafés
                            </span>
                            <span>{formatPrice(cafeCount * CAFE_PRICE)}</span>
                        </div>

                        <div className="flex items-end justify-between gap-2 pt-2">
                            <span className="font-semibold">
                                Total à encaisser
                            </span>
                            <span className="text-2xl font-bold">
                                {formatPrice(total)}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={resetOrders}
                        disabled={servedCount === 0}
                        className="mt-5 w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Réinitialiser les commandes
                    </button>
                </aside>
            </div>
        </div>
    )
}

function ResidentCard({
    id,
    name,
    order,
    onChange,
}: {
    id: number
    name: string
    order: Order
    onChange: (item: keyof Order, checked: boolean) => void
}) {
    const items: { id: keyof Order; label: string }[] = [
        { id: "menu", label: "Menu" },
        { id: "cafe", label: "Café" },
    ]

    return (
        <div className="rounded-lg border bg-background p-3">
            <h2 className="mb-3 text-center text-sm font-semibold">
                {name}
            </h2>

            <FieldGroup className="flex flex-row flex-wrap justify-center gap-3">
                {items.map((item) => {
                    const checkboxId = `resident-${id}-${item.id}`

                    return (
                        <FieldLabel
                            key={item.id}
                            htmlFor={checkboxId}
                            className="flex cursor-pointer items-center gap-1.5"
                        >
                            <Field orientation="horizontal">
                                <Checkbox
                                    id={checkboxId}
                                    name={checkboxId}
                                    checked={order[item.id]}
                                    onCheckedChange={(checked) =>
                                        onChange(item.id, checked === true)
                                    }
                                />
                                <FieldContent>
                                    <FieldTitle className="text-xs">
                                        {item.label}
                                    </FieldTitle>
                                </FieldContent>
                            </Field>
                        </FieldLabel>
                    )
                })}
            </FieldGroup>
        </div>
    )
}
