"use client"

import {
  type ColumnDef,
  type RowData,
  useTable,
} from "@tanstack/react-table"
import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SearchIcon,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"

import {
  features,
  type DataTableFeatures,
} from "@/components/data-table/data-table-features"
import { Input } from "./ui/input"
import { useState } from "react"

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
}

export function DataTable<TData extends RowData>({
  columns = [],
  data = [],
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    columns,
    data,

    globalFilterFn: "includesString",
  })

  return (
    <div className="w-full space-y-4">
      <div className="relative w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <DebouncedInput
            value={table.state.globalFilter ?? ''}
            onChange={(value) => table.setGlobalFilter(String(value))}
            placeholder="Search all columns..."
            className="pl-8"
          />
        </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted()

                  const SortIcon =
                    sorted === "asc"
                      ? ArrowUp
                      : sorted === "desc"
                        ? ArrowDown
                        : ArrowUpDown

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          {header.column.getCanSort() ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="-ml-3 h-8"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <table.FlexRender header={header} />

                              <SortIcon className="ml-2 size-4" />
                            </Button>
                          ) : (
                            <span className="text-sm font-medium">
                              <table.FlexRender header={header} />
                            </span>
                          )}
                        </>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={
                    row.getIsSelected() ? "selected" : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4 px-2 py-4">
        {/* Rows count */}
        <div className="text-sm text-muted-foreground">
          {table
            .getPrePaginatedRowModel()
            .rows.length.toLocaleString()}{" "}
          sur {data.length.toLocaleString()} lignes
        </div>

        <div className="flex items-center gap-6 lg:gap-8">
          {/* Page size */}
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">
              Lignes par page
            </p>

            <Select
              value={`${table.state.pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger
                size="sm"
                className="w-17.5"
              >
                <SelectValue
                  placeholder={`${table.state.pagination.pageSize}`}
                />
              </SelectTrigger>

              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem
                    key={pageSize}
                    value={`${pageSize}`}
                  >
                    {pageSize}
                  </SelectItem>
                ))}

                <SelectItem value="Infinity">
                  Toutes
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current page */}
          <div className="flex w-25 items-center justify-center text-sm font-medium">
            Page {table.state.pagination.pageIndex + 1} sur{" "}
            {Math.max(1, table.getPageCount())}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {/* First */}
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">
                Première page
              </span>

              <ChevronsLeftIcon />
            </Button>

            {/* Previous */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">
                Page précédente
              </span>

              <ChevronLeftIcon />
            </Button>

            {/* Next */}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">
                Page suivante
              </span>

              <ChevronRightIcon />
            </Button>

            {/* Last */}
            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">
                Dernière page
              </span>

              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 300,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.ComponentProps<typeof Input>, 'onChange'>) {
  const [value, setValue] = useState(initialValue)

  // ⚠️ Correctif : on ne synchronise plus `value` avec `initialValue` via
  // useEffect (ça déclenche un rendu "en trop" après le commit — d'où
  // l'avertissement React sur les cascading renders). À la place, on
  // ajuste le state pendant le rendu lui-même : si `initialValue` a changé
  // depuis le dernier rendu, on remet `value` à jour tout de suite, avant
  // que le DOM ne soit peint. C'est le pattern recommandé par React pour
  // "réinitialiser un state quand une prop change".
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue)
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue)
    setValue(initialValue)
  }

  const debouncedOnChange = useDebouncedCallback(onChange, { wait: debounce })

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
        debouncedOnChange(e.target.value)
      }}
    />
  )
}