"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Database } from "@/database.types";
import { type DataTableFeatures } from "@/components/data-table/data-table-features";
import { ResidentActions } from "@/components/resident/resident-actions";

type ResidentRow = Database['public']['Tables']['residents']['Row'];

const columnHelper = createColumnHelper<DataTableFeatures, ResidentRow>();

export const columns = columnHelper.columns([
  columnHelper.accessor("prefix", {
    header: "Préfixe"
  }),
  columnHelper.accessor("last_name", {
    header: "Nom",
  }),
  columnHelper.accessor("first_name", {
    header: "Prénom",
  }),
  columnHelper.accessor("room", {
    header: "Appartement",
  }),
  columnHelper.accessor("building", {
    header: "Bâtiment",
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      return <ResidentActions resident={row.original} />;
    },
  }),
]);