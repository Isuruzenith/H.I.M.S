"use client";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/tables/empty-state";
import { TableSkeleton } from "@/components/tables/table-skeleton";

export type DataColumn<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  data,
  loading,
  search,
  onSearch,
  emptyMessage,
}: {
  columns: DataColumn<T>[];
  data: T[];
  loading?: boolean;
  search?: string;
  onSearch?: (value: string) => void;
  emptyMessage?: string;
}) {
  return (
    <div className="space-y-4">
      {onSearch ? (
        <Input
          value={search ?? ""}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search records..."
          className="max-w-sm"
        />
      ) : null}

      {loading ? (
        <TableSkeleton />
      ) : data.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="overflow-hidden rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.header} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={column.header} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
