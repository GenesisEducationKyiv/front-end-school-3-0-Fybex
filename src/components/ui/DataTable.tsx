import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type TableMeta,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/utils";

interface DataTableProps<
  TData,
  TMeta extends TableMeta<TData> = TableMeta<TData>
> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading: boolean;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  pageSizes: number[];
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
  onRowSelectionChange?: (selectedRowIds: (string | number)[]) => void;
  meta?: TMeta;
  LoadingSkeletonComponent?: React.ComponentType<{
    rowCount: number;
    columns: ColumnDef<TData>[];
  }>;
}

export function DataTable<
  TData extends { id: string | number },
  TMeta extends TableMeta<TData> = TableMeta<TData>
>({
  columns,
  data,
  isLoading,
  pageCount,
  pageIndex,
  pageSize,
  pageSizes,
  onPaginationChange,
  onRowSelectionChange,
  meta,
  LoadingSkeletonComponent,
}: DataTableProps<TData, TMeta>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination: { pageIndex, pageSize },
      rowSelection,
    },
    manualPagination: true,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      onPaginationChange(next.pageIndex, next.pageSize);
    },
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);

      if (onRowSelectionChange) {
        const selectedRowIds = Object.keys(newSelection)
          .filter((key) => newSelection[key])
          .map((index) => data[Number(index)]?.id)
          .filter((id): id is string | number => id !== undefined);
        const finalSelectedIds = selectedRowIds;
        onRowSelectionChange(finalSelectedIds);
      }
    },
    ...(meta && { meta }),
  });

  useEffect(() => {
    table.resetRowSelection(false);
  }, [data, table]);

  return (
    <>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const columnMeta = header.column.columnDef.meta as
                  | { className?: string }
                  | undefined;
                const headerClassName = columnMeta?.className;

                return (
                  <TableHead className={cn(headerClassName)} key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody data-loading={isLoading ? "true" : undefined}>
          {isLoading && LoadingSkeletonComponent && (
            <LoadingSkeletonComponent columns={columns} rowCount={pageSize} />
          )}
          {!isLoading && table.getRowModel().rows.length === 0 && (
            <TableRow>
              <TableCell className="text-center h-24" colSpan={columns.length}>
                No results.
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            table.getRowModel().rows.length > 0 &&
            table.getRowModel().rows.map((row) => {
              const rowId = row.original.id;
              const testId = rowId
                ? `track-item-${rowId.toString()}`
                : undefined;
              return (
                <TableRow
                  className={cn(
                    "group hover:bg-muted/50 transition-colors",
                    row.getIsSelected() && "bg-muted"
                  )}
                  data-state={row.getIsSelected() && "selected"}
                  data-testid={testId}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => {
                    const columnMeta = cell.column.columnDef.meta as
                      | { className?: string }
                      | undefined;
                    const cellClassName = columnMeta?.className;

                    return (
                      <TableCell className={cn(cellClassName)} key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <div
        className="flex items-center justify-end space-x-6 py-4"
        data-testid="pagination"
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            aria-disabled={isLoading}
            disabled={isLoading}
            value={String(pageSize)}
            onValueChange={(v) => {
              onPaginationChange(0, Number(v));
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Page {pageIndex + 1} of {pageCount || 1}
          </span>
          <Button
            aria-disabled={pageIndex === 0 || isLoading}
            data-loading={isLoading ? "true" : undefined}
            disabled={pageIndex === 0 || isLoading}
            size="sm"
            variant="outline"
            onClick={() => {
              onPaginationChange(0, pageSize);
            }}
          >
            First
          </Button>
          <Button
            aria-disabled={pageIndex === 0 || isLoading}
            data-loading={isLoading ? "true" : undefined}
            data-testid="pagination-prev"
            disabled={pageIndex === 0 || isLoading}
            size="sm"
            variant="outline"
            onClick={() => {
              onPaginationChange(pageIndex - 1, pageSize);
            }}
          >
            Previous
          </Button>
          <Button
            aria-disabled={pageIndex + 1 >= (pageCount || 1) || isLoading}
            data-loading={isLoading ? "true" : undefined}
            data-testid="pagination-next"
            disabled={pageIndex + 1 >= (pageCount || 1) || isLoading}
            size="sm"
            variant="outline"
            onClick={() => {
              onPaginationChange(pageIndex + 1, pageSize);
            }}
          >
            Next
          </Button>
          <Button
            aria-disabled={pageIndex + 1 >= (pageCount || 1) || isLoading}
            data-loading={isLoading ? "true" : undefined}
            disabled={pageIndex + 1 >= (pageCount || 1) || isLoading}
            size="sm"
            variant="outline"
            onClick={() => {
              onPaginationChange((pageCount || 1) - 1, pageSize);
            }}
          >
            Last
          </Button>
        </div>
      </div>
    </>
  );
}
