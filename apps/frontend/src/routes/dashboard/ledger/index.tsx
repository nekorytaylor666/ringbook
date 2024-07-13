import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { createFileRoute } from "@tanstack/react-router";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { H4 } from "@/components/ui/typography";

import { Skeleton } from "@/components/ui/skeleton";
// Use the types from your schema
import type {
  JournalEntryExpanded,
  TransactionExpanded,
} from "../../../../../backend/src/db/schema";

const columns: ColumnDef<TransactionExpanded>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        onClick={row.getToggleExpandedHandler()}
        style={{ cursor: "pointer" }}
      >
        {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
      </Button>
    ),
  },
  {
    accessorKey: "transactionId",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          ID
          <Button
            variant="ghost"
            size={"icon"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          Date
          <Button
            variant="ghost"
            size={"icon"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
];

const TransactionTable = ({ data }: { data: TransactionExpanded[] }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
      sorting,
      columnFilters,
      globalFilter,
    },
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return String(value).toLowerCase().includes(filterValue.toLowerCase());
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search all columns..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <TableRow>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {row.getIsExpanded() && (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <JournalEntriesTable
                      entries={row.original.journalEntries}
                    />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const JournalEntriesTable = ({
  entries,
}: {
  entries: JournalEntryExpanded[];
}) => (
  <Table className="mt-4 container max-w-sm">
    <TableHeader>
      <TableRow>
        <TableHead className="w-[180px]">Account</TableHead>
        <TableHead className="text-right">Debit</TableHead>
        <TableHead className="text-right">Credit</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {entries.map((entry) => (
        <TableRow key={entry.entryId}>
          <TableCell className="font-medium">{entry.account.name}</TableCell>
          <TableCell className="text-right">
            {!entry.isCredit ? `$${entry.amount}` : ""}
          </TableCell>
          <TableCell className="text-right">
            {entry.isCredit ? `$${entry.amount}` : ""}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export const Route = createFileRoute("/dashboard/ledger/")({
  component: LedgerPage,
  pendingComponent: LedgerPageSkeleton,
});

function LedgerPage() {
  const [data] = trpc.getTransactions.useSuspenseQuery();
  return (
    <div className="w-full bg-muted/70">
      <div className="flex h-16 items-center justify-start border-b px-4 bg-background">
        <H4>Feed</H4>
      </div>

      <div className="">
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="container mt-8 max-w-screen-lg">
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  View all transactions in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable data={data} />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function LedgerPageSkeleton() {
  return (
    <div className="w-full bg-muted/70">
      <div className="flex h-16 items-center justify-start border-b px-4 bg-background">
        <H4>Feed</H4>
      </div>

      <div className="">
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="container mt-8 max-w-screen-lg">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-8 w-3/4" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-full" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-64" /> {/* Search bar */}
                  <div className="border rounded-md">
                    <div className="border-b">
                      {" "}
                      {/* Table header */}
                      <div className="flex p-4">
                        <Skeleton className="h-6 w-6 mr-4" /> {/* Expander */}
                        <Skeleton className="h-6 w-16 mr-4" /> {/* ID */}
                        <Skeleton className="h-6 w-32 mr-4" />{" "}
                        {/* Description */}
                        <Skeleton className="h-6 w-24" /> {/* Date */}
                      </div>
                    </div>
                    <div className="divide-y">
                      {" "}
                      {/* Table rows */}
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className="flex p-4">
                          <Skeleton className="h-6 w-6 mr-4" />
                          <Skeleton className="h-6 w-16 mr-4" />
                          <Skeleton className="h-6 w-full mr-4" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
