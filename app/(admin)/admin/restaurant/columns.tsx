"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Database } from "@/database.types";
import { type DataTableFeatures } from "@/components/data-table/data-table-features";

type ProductRow = Database['public']['Tables']['products']['Row'];

const columnHelper = createColumnHelper<DataTableFeatures, ProductRow>();

export const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Produit"
  }),
  columnHelper.accessor("price", {
    header: "Prix",
    cell: ({ row }) => {
      return <span>{Intl.NumberFormat('fr', {currency: 'EUR', style: 'currency'}).format(Number(row.getValue('price')) / 100)}</span>
    }
  }),
  columnHelper.accessor("is_available", {
    header: "Dispo ?",
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      return <div></div>;
    },
  }),
]);