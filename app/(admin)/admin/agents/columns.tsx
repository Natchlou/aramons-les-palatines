"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Database } from "@/database.types";
import { type DataTableFeatures } from "@/components/data-table/data-table-features";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import Link from "next/link";

type AgentRow = Database['public']['Tables']['agent']['Row'];

const columnHelper = createColumnHelper<DataTableFeatures, AgentRow>();

export const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Nom"
  }),
  columnHelper.accessor("working_days", {
    header: "Jours de travail",
  }),
  columnHelper.accessor("isAbsent", {
    header: "Absent ?",
  }),
  columnHelper.accessor("maxSlotsPerDay", {
    header: "Ménage par jours",
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      return <Link href={`/admin/agents/${row.original.id}`} ><Button><EyeIcon /></Button></Link>;
    },
  }),
]);