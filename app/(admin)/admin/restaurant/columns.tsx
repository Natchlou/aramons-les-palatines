"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Database } from "@/database.types";
import { type DataTableFeatures } from "@/components/data-table/data-table-features";
import { Badge } from "@/components/ui/badge";

type ProductRow = Database['public']['Tables']['products']['Row'];

const columnHelper = createColumnHelper<DataTableFeatures, ProductRow>();

export const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Produit"
  }),
  columnHelper.accessor("price", {
    header: "Prix",
    cell: ({ row }) => {
      return <span>{Intl.NumberFormat('fr', { currency: 'EUR', style: 'currency' }).format(Number(row.getValue('price')) / 100)}</span>
    }
  }),
  columnHelper.accessor("is_available", {
    header: "Dispo ?",
    cell: ({ row }) => {
      return <Badge variant={row.original.is_available ? 'default' : 'destructive'}>{row.original.is_available ? 'Oui' : 'Non'}</Badge>
    },
  }),
  columnHelper.display({
    id: "actions",
    cell: () => {
      return <div></div>;
    },
  }),
]);