import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  useReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface DataTableProps<TData extends { id?: string | number }> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading: boolean;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  pageSizes: number[];
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
  onRowSelectionChange?: (selectedRowIds: (string | number)[]) => void;
  meta?: Record<string, unknown>;
  LoadingSkeletonComponent?: React.ComponentType<{
    rowCount: number;
    columns: ColumnDef<TData, unknown>[];
  }>;
}

export function DataTable<TData extends { id?: string | number }>({
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
}: DataTableProps<TData>) {
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
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize })
          : updater;
      onPaginationChange(next.pageIndex, next.pageSize);
    },
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newSelection);

      if (onRowSelectionChange) {
        const selectedRowIds = Object.keys(newSelection)
          .filter((key) => newSelection[key])
          .map((index) => data[Number(index)]?.id)
          .filter((id): id is string | number => id !== undefined);
        const finalSelectedIds = selectedRowIds as (string | number)[];
        onRowSelectionChange(finalSelectedIds);
      }
    },
    meta,
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
                  <TableHead key={header.id} className={cn(headerClassName)}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody data-loading={isLoading ? 'true' : undefined}>
          {isLoading && LoadingSkeletonComponent && (
            <LoadingSkeletonComponent rowCount={pageSize} columns={columns} />
          )}
          {!isLoading && table.getRowModel().rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className='text-center h-24'>
                No results.
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            table.getRowModel().rows.length > 0 &&
            table.getRowModel().rows.map((row) => {
              const rowId = row.original.id;
              const testId = rowId ? `track-item-${rowId}` : undefined;
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    'group hover:bg-muted/50 transition-colors',
                    row.getIsSelected() && 'bg-muted',
                  )}
                  data-testid={testId}
                >
                  {row.getVisibleCells().map((cell) => {
                    const columnMeta = cell.column.columnDef.meta as
                      | { className?: string }
                      | undefined;
                    const cellClassName = columnMeta?.className;

                    return (
                      <TableCell key={cell.id} className={cn(cellClassName)}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
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
        className='flex items-center justify-end space-x-6 py-4'
        data-testid='pagination'
      >
        <div className='flex items-center space-x-2'>
          <span className='text-sm text-muted-foreground'>Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPaginationChange(0, Number(v))}
            disabled={isLoading}
            aria-disabled={isLoading}
          >
            <SelectTrigger className='w-[80px]'>
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

        <div className='flex items-center space-x-2'>
          <span className='text-sm text-muted-foreground'>
            Page {pageIndex + 1} of {pageCount || 1}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPaginationChange(0, pageSize)}
            disabled={pageIndex === 0 || isLoading}
            aria-disabled={pageIndex === 0 || isLoading}
            data-loading={isLoading ? 'true' : undefined}
          >
            First
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPaginationChange(pageIndex - 1, pageSize)}
            disabled={pageIndex === 0 || isLoading}
            aria-disabled={pageIndex === 0 || isLoading}
            data-loading={isLoading ? 'true' : undefined}
            data-testid='pagination-prev'
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPaginationChange(pageIndex + 1, pageSize)}
            disabled={pageIndex + 1 >= (pageCount || 1) || isLoading}
            aria-disabled={pageIndex + 1 >= (pageCount || 1) || isLoading}
            data-loading={isLoading ? 'true' : undefined}
            data-testid='pagination-next'
          >
            Next
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPaginationChange((pageCount || 1) - 1, pageSize)}
            disabled={pageIndex + 1 >= (pageCount || 1) || isLoading}
            aria-disabled={pageIndex + 1 >= (pageCount || 1) || isLoading}
            data-loading={isLoading ? 'true' : undefined}
          >
            Last
          </Button>
        </div>
      </div>
    </>
  );
}
