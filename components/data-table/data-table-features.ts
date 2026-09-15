import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
} from "@tanstack/react-table"

export const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  // ⚠️ Correctif : globalFilterFn (option passée à useTable) appartient à
  // globalFilteringFeature, une feature distincte de columnFilteringFeature.
  // Sans elle, TypeScript rejette "globalFilterFn" comme propriété inconnue
  // de TableOptions. Le filteredRowModel existant est réutilisé, pas besoin
  // d'un nouveau row model.
  globalFilteringFeature,

  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,

  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),

  filterFns: {
    includesString: filterFn_includesString,
  },

  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
  },
})

export type DataTableFeatures = typeof features