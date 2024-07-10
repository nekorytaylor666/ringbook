import { groupBy } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Account } from "../../../../../backend/src/db/schema";
import type { JournalEntry } from "../../../../../backend/src/lib/extractJournalEntry";

export function useJournalEntryForm(
  journalEntry: JournalEntry,
  accounts: Account[],
) {
  const { formState, register, setValue, watch, getValues, reset } = useForm({
    defaultValues: { journalEntry },
  });

  const [isBalanced, setIsBalanced] = useState(false);
  const [equation, setEquation] = useState({
    assets: 0,
    liabilities: 0,
    equity: 0,
  });
  const [unbalancedDifference, setUnbalancedDifference] = useState(0);
  const accountsByType = groupBy<Account>(accounts, (account) => account.type);
  const allFields = watch();

  useEffect(() => {
    reset({ journalEntry });
  }, [journalEntry, reset]);

  useEffect(() => {
    const newEquation = getValues("journalEntry.entries").reduce(
      (acc, entry) => {
        const debit = Number.parseFloat(entry.debit) || 0;
        const credit = Number.parseFloat(entry.credit) || 0;

        if (entry.accountType === "Asset") {
          acc.assets += debit - credit;
        } else if (entry.accountType === "Liability") {
          acc.liabilities += credit - debit;
        } else if (
          entry.accountType === "Equity" ||
          entry.accountType === "Revenue"
        ) {
          acc.equity += credit - debit;
        } else if (entry.accountType === "Expense") {
          acc.equity -= debit - credit;
        }
        return acc;
      },
      { assets: 0, liabilities: 0, equity: 0 },
    );

    setEquation(newEquation);

    const difference =
      newEquation.assets - (newEquation.liabilities + newEquation.equity);
    setUnbalancedDifference(difference);
    setIsBalanced(Math.abs(difference) < 0.001);
  }, [JSON.stringify(allFields)]);

  return {
    formState,
    watch,
    setValue,
    isBalanced,
    equation,
    accountsByType,
    unbalancedDifference,
  };
}
