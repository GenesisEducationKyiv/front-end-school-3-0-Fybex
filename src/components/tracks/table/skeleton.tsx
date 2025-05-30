import { ColumnDef } from '@tanstack/react-table';

import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

interface ColumnMeta {
  className?: string;
  skeletonHeight?: string;
}

interface TracksTableBodySkeletonProps<TData> {
  rowCount?: number;
  columnCount?: number;
  columns: ColumnDef<TData, unknown>[];
}

export function TracksTableBodySkeleton<TData>({
  rowCount = 10,
  columns,
}: TracksTableBodySkeletonProps<TData>) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`} data-testid='loading-tracks'>
          {columns.map((column, colIndex) => {
            const meta = column?.meta as ColumnMeta | undefined;

            const cellClassName = meta?.className || '';
            const skeletonHeightClass = meta?.skeletonHeight || 'h-4';

            return (
              <TableCell
                key={`skeleton-cell-${rowIndex}-${colIndex}`}
                className={cellClassName}
                data-loading='true'
              >
                <Skeleton className={`${skeletonHeightClass} w-full`} />
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </>
  );
}
