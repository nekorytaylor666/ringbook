import { cn, groupBy } from "@/lib/utils";
import {
  ArrowBigDown,
  ArrowBigUp,
  Check,
  ChevronsUpDown,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Account } from "../../../../../backend/src/db/schema";
import type { JournalEntry } from "../../../../../backend/src/lib/extractJournalEntry";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useJournalEntryForm } from "./useJournalEntryForm";

export function JournalEntryModal({
  journalEntry,
  accounts,
  onEntryChange,
}: {
  journalEntry: JournalEntry;
  accounts: Account[];
  onEntryChange?: (entries: JournalEntry["entries"]) => void;
}) {
  const {
    formState,
    watch,
    setValue,
    isBalanced,
    equation,
    accountsByType,
    unbalancedDifference,
  } = useJournalEntryForm(journalEntry, accounts, onEntryChange);

  const addEntry = () => {
    const currentEntries = watch("journalEntry.entries");
    setValue("journalEntry.entries", [
      ...currentEntries,
      { accountId: "", accountName: "", accountType: "", debit: 0, credit: 0 },
    ]);
  };

  const removeEntry = (index: number) => {
    const currentEntries = watch("journalEntry.entries");
    setValue(
      "journalEntry.entries",
      currentEntries.filter((_, i) => i !== index),
    );
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Journal Entry</CardTitle>
        <CardDescription>{journalEntry.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {journalEntry.entries.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {watch(`journalEntry.entries.${index}.accountName`) ||
                          "Select account"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search account..." />
                        <CommandEmpty>No account found.</CommandEmpty>
                        <CommandGroup>
                          <CommandList>
                            {Object.entries(accountsByType).map(
                              ([type, accountList]) => (
                                <CommandGroup
                                  key={type}
                                  heading={
                                    type.charAt(0).toUpperCase() + type.slice(1)
                                  }
                                >
                                  {accountList.map((account) => (
                                    <CommandItem
                                      key={account.name}
                                      keywords={[account.name, type]}
                                      onSelect={() => {
                                        setValue(
                                          `journalEntry.entries.${index}.accountId`,
                                          account.accountId,
                                        );
                                        setValue(
                                          `journalEntry.entries.${index}.accountName`,
                                          account.name,
                                        );
                                        setValue(
                                          `journalEntry.entries.${index}.accountType`,
                                          type,
                                        );
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          watch(
                                            `journalEntry.entries.${index}.accountId`,
                                          ) === account.accountId
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      {account.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              ),
                            )}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentDebit =
                        watch(`journalEntry.entries.${index}.debit`) || 0;
                      const currentCredit =
                        watch(`journalEntry.entries.${index}.credit`) || 0;
                      const currentValue = currentDebit || currentCredit;
                      const accountType = watch(
                        `journalEntry.entries.${index}.accountType`,
                      );

                      if (currentDebit > 0) {
                        setValue(
                          `journalEntry.entries.${index}.credit`,
                          currentValue,
                        );
                        setValue(`journalEntry.entries.${index}.debit`, 0);
                      } else {
                        setValue(
                          `journalEntry.entries.${index}.debit`,
                          currentValue,
                        );
                        setValue(`journalEntry.entries.${index}.credit`, 0);
                      }
                    }}
                  >
                    {watch(`journalEntry.entries.${index}.debit`) > 0
                      ? "Debit"
                      : "Credit"}
                    {(() => {
                      const isDebit =
                        watch(`journalEntry.entries.${index}.debit`) > 0;
                      const accountType = watch(
                        `journalEntry.entries.${index}.accountType`,
                      );
                      const isPositive =
                        (isDebit &&
                          ["Asset", "Expense"].includes(accountType)) ||
                        (!isDebit &&
                          ["Liability", "Equity", "Revenue"].includes(
                            accountType,
                          ));

                      return isPositive ? (
                        <ArrowBigUp className="size-4 ml-1" />
                      ) : (
                        <ArrowBigDown className="size-4 ml-1" />
                      );
                    })()}
                  </Button>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={
                      watch(`journalEntry.entries.${index}.debit`) ||
                      watch(`journalEntry.entries.${index}.credit`) ||
                      ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (watch(`journalEntry.entries.${index}.debit`) > 0) {
                        setValue(
                          `journalEntry.entries.${index}.debit`,
                          Number.parseFloat(value),
                        );
                      } else {
                        setValue(
                          `journalEntry.entries.${index}.credit`,
                          Number.parseFloat(value),
                        );
                      }
                    }}
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEntry(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end mt-2">
          <Button type="button" variant="outline" size="sm" onClick={addEntry}>
            <Plus className="h-4 w-4 mr-2" /> Add Entry
          </Button>
        </div>
        <div className="mt-4">
          <p
            className={`text-${isBalanced ? "green" : "red"}-600 font-semibold`}
          >
            {isBalanced ? "Entries are balanced" : "Entries are not balanced"}
          </p>
          {!isBalanced && (
            <p className="text-red-600">
              Equation is unbalanced by $
              {Math.abs(unbalancedDifference).toFixed(2)}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <div className="flex justify-evenly w-full text-center font-mono ">
          <div>
            <div className="text-sm font-semibold mb-1">Assets</div>
            <div className="text-2xl font-medium">
              {equation.assets.toFixed(2).toLocaleString()}
            </div>
          </div>
          <div className="text-3xl font-bold self-end">=</div>
          <div>
            <div className="text-sm font-semibold mb-1">Liabilities</div>
            <div className="text-2xl font-medium">
              {equation.liabilities.toFixed(2).toLocaleString()}
            </div>
          </div>
          <div className="text-2xl font-bold self-end">+</div>
          <div>
            <div className="text-sm font-semibold mb-1">Equity</div>
            <div className="text-2xl font-medium">
              {equation.equity.toFixed(2).toLocaleString()}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
