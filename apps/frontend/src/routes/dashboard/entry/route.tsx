import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  ChevronsUpDown,
  Equal,
  Plus,
  X,
} from "lucide-react";
import React, { useState, useEffect } from "react";

export const Route = createFileRoute("/dashboard/entry")({
  component: JournalEntryApp,
});

function JournalEntryApp() {
  const [accounts, setAccounts] = useState({
    assets: [
      { id: "asset1", name: "Cash" },
      { id: "asset2", name: "Accounts Receivable" },
      { id: "asset3", name: "Inventory" },
      { id: "asset4", name: "Prepaid Expenses" },
      { id: "asset5", name: "Investments" },
      { id: "asset6", name: "Property, Plant, and Equipment" },
      { id: "asset7", name: "Intangible Assets" },
    ],
    liabilities: [
      { id: "liability1", name: "Accounts Payable" },
      { id: "liability2", name: "Short-term Loans" },
      { id: "liability3", name: "Accrued Expenses" },
      { id: "liability4", name: "Unearned Revenue" },
      { id: "liability5", name: "Long-term Debt" },
      { id: "liability6", name: "Lease Obligations" },
    ],
    equity: [
      { id: "equity1", name: "Common Stock" },
      { id: "equity2", name: "Preferred Stock" },
      { id: "equity3", name: "Retained Earnings" },
      { id: "equity4", name: "Additional Paid-in Capital" },
      { id: "equity5", name: "Treasury Stock" },
    ],
    revenue: [
      { id: "revenue1", name: "Sales Revenue" },
      { id: "revenue2", name: "Service Revenue" },
      { id: "revenue3", name: "Interest Income" },
      { id: "revenue4", name: "Rental Income" },
    ],
    expenses: [
      { id: "expense1", name: "Cost of Goods Sold" },
      { id: "expense2", name: "Salaries Expense" },
      { id: "expense3", name: "Rent Expense" },
      { id: "expense4", name: "Utilities Expense" },
      { id: "expense5", name: "Depreciation Expense" },
      { id: "expense6", name: "Interest Expense" },
      { id: "expense7", name: "Advertising Expense" },
    ],
  });

  const [currentEntry, setCurrentEntry] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [entryAmount, setEntryAmount] = useState("");
  const [isBalanced, setIsBalanced] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [accountingEquation, setAccountingEquation] = useState({
    assets: 0,
    liabilities: 0,
    equity: 0,
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    updateAccountingEquation();
  }, [currentEntry]);

  const addAccount = (type) => {
    setAccounts((prev) => ({
      ...prev,
      [type]: [...prev[type], { name: `New ${type.slice(0, -1)}` }],
    }));
  };

  const addToEntry = (isDebit) => {
    if (selectedAccount && entryAmount) {
      const newEntry = {
        ...selectedAccount,
        amount: Number.parseFloat(entryAmount),
        isDebit,
      };
      setCurrentEntry([...currentEntry, newEntry]);
      setSelectedAccount(null);
      setEntryAmount("");
    }
  };

  const removeFromEntry = (index) => {
    setCurrentEntry(currentEntry.filter((_, i) => i !== index));
  };

  const openEditDialog = (entry, index) => {
    setEditingEntry({ ...entry, index });
    setEditDialogOpen(true);
  };

  const saveEditedEntry = () => {
    setCurrentEntry(
      currentEntry.map((entry, index) =>
        index === editingEntry.index ? editingEntry : entry,
      ),
    );
    setEditDialogOpen(false);
    setEditingEntry(null);
  };

  const updateAccountingEquation = () => {
    const newEquation = currentEntry.reduce(
      (acc, entry) => {
        const amount = entry.amount;
        if (entry.type === "assets") {
          acc.assets += entry.isDebit ? amount : -amount;
        } else if (entry.type === "liabilities") {
          acc.liabilities += entry.isDebit ? -amount : amount;
        } else if (entry.type === "equity" || entry.type === "revenue") {
          acc.equity += entry.isDebit ? -amount : amount;
        } else if (entry.type === "expenses") {
          acc.equity += entry.isDebit ? amount : -amount;
        }
        return acc;
      },
      { assets: 0, liabilities: 0, equity: 0 },
    );

    setAccountingEquation(newEquation);
    setIsBalanced(
      Math.abs(
        newEquation.assets - (newEquation.liabilities + newEquation.equity),
      ) < 0.001,
    );
  };

  const renderAccountList = (type) => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="capitalize">{type}</span>
          <Button variant="outline" size="sm" onClick={() => addAccount(type)}>
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-40">
          {accounts[type].map((account, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start mb-1"
              onClick={() => setSelectedAccount({ type, name: account.name })}
            >
              {account.name}
            </Button>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        RingBook Entry Demo
      </h1>

      {/* Accounting Equation Display */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Accounting Equation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center text-3xl font-bold">
            <div className="flex flex-col items-center">
              <span className="text-lg font-normal">Assets</span>
              <span>${accountingEquation.assets.toFixed(2)}</span>
            </div>
            <Equal className="mx-4 h-8 w-8" />
            <div className="flex flex-col items-center">
              <span className="text-lg font-normal">Liabilities</span>
              <span>${accountingEquation.liabilities.toFixed(2)}</span>
            </div>
            <span className="mx-4">+</span>
            <div className="flex flex-col items-center">
              <span className="text-lg font-normal">Equity</span>
              <span>${accountingEquation.equity.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Entry Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Journal Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {currentEntry.map((entry, index) => (
              <Badge
                key={index}
                variant={entry.isDebit ? "default" : "secondary"}
                className="text-sm cursor-pointer"
                onClick={() => openEditDialog(entry, index)}
              >
                {entry.name} - ${entry.amount} {entry.isDebit ? "Dr" : "Cr"}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromEntry(index);
                  }}
                  className="ml-2 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between"
                >
                  {selectedAccount ? selectedAccount.name : "Select account..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search account..." />
                  <CommandEmpty>No account found.</CommandEmpty>
                  <CommandList>
                    {Object.entries(accounts).map(([type, accountList]) => (
                      <CommandGroup
                        key={type}
                        heading={type.charAt(0).toUpperCase() + type.slice(1)}
                      >
                        {accountList.map((account) => (
                          <CommandItem
                            key={account.name}
                            onSelect={() => {
                              setSelectedAccount({ type, name: account.name });
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedAccount?.name === account.name
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {account.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Input
              type="number"
              value={entryAmount}
              onChange={(e) => setEntryAmount(e.target.value)}
              placeholder="Amount"
              className="w-32"
            />
            <Button
              onClick={() => addToEntry(true)}
              disabled={!selectedAccount || !entryAmount}
            >
              Debit
            </Button>
            <Button
              onClick={() => addToEntry(false)}
              disabled={!selectedAccount || !entryAmount}
            >
              Credit
            </Button>
          </div>
        </CardContent>
      </Card>

      {isBalanced !== null && (
        <Alert
          variant={isBalanced ? "default" : "destructive"}
          className="mb-6"
        >
          {isBalanced ? (
            <>
              <Check className="h-4 w-4" />
              <AlertTitle>Balanced</AlertTitle>
              <AlertDescription>
                The journal entry is balanced.
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Balanced</AlertTitle>
              <AlertDescription>
                The journal entry is not balanced. Please check your entries.
              </AlertDescription>
            </>
          )}
        </Alert>
      )}

      {/* Account Lists */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">{renderAccountList("assets")}</div>
        <div className="col-span-1">{renderAccountList("liabilities")}</div>
        <div className="col-span-1">{renderAccountList("equity")}</div>
        <div className="col-span-1">{renderAccountList("revenue")}</div>
        <div className="col-span-1">{renderAccountList("expenses")}</div>
      </div>

      {/* Edit Entry Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <>
              <Input
                value={editingEntry.name}
                onChange={(e) =>
                  setEditingEntry({ ...editingEntry, name: e.target.value })
                }
                className="mb-2"
              />
              <Input
                type="number"
                value={editingEntry.amount}
                onChange={(e) =>
                  setEditingEntry({
                    ...editingEntry,
                    amount: Number.parseFloat(e.target.value),
                  })
                }
                className="mb-2"
              />
              <div className="flex justify-between">
                <Button
                  onClick={() =>
                    setEditingEntry({ ...editingEntry, isDebit: true })
                  }
                  variant={editingEntry.isDebit ? "default" : "outline"}
                >
                  Debit
                </Button>
                <Button
                  onClick={() =>
                    setEditingEntry({ ...editingEntry, isDebit: false })
                  }
                  variant={!editingEntry.isDebit ? "default" : "outline"}
                >
                  Credit
                </Button>
              </div>
            </>
          )}
          <DialogFooter>
            <Button onClick={saveEditedEntry}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default JournalEntryApp;
