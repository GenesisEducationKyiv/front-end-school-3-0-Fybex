import { type ColumnDef } from "@tanstack/react-table";

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

import { type ColumnMeta } from "./columns";

interface TracksTableBodySkeletonProps<TData> {
  rowCount?: number;
  columnCount?: number;
  columns: ColumnDef<TData>[];
}

export function TracksTableBodySkeleton<TData>({
  rowCount = 10,
  columns,
}: TracksTableBodySkeletonProps<TData>) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow
          data-testid="loading-tracks"
          key={`skeleton-row-${rowIndex.toString()}`}
        >
          {columns.map((column, colIndex) => {
            const meta = column.meta as ColumnMeta | undefined;

            const cellClassName = meta?.className ?? "";
            const skeletonHeightClass = meta?.skeletonHeight ?? "h-4";

            return (
              <TableCell
                className={cellClassName}
                data-loading="true"
                key={`skeleton-cell-${rowIndex.toString()}-${colIndex.toString()}`}
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
