import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import type { JournalEntry } from "../../../../backend/src/lib/extractJournalEntry";
import { type FormValues, JournalEntryForm } from "./AddJournalForm";
import { JournalEntryModal } from "./journalEntry";
import { useJournalEntryMutation } from "./useJournalEntryMutation";

export function AddJournalEntry() {
  const { data: accounts } = trpc.getAccounts.useQuery();
  const utils = trpc.useUtils();

  const { mutate, isLoading, journalEntry, reset } = useJournalEntryMutation();
  const { mutate: addTweet, isLoading: isAddingTweet } =
    trpc.addTweet.useMutation({
      onSuccess() {
        toast.success("Tweet added");
        utils.tweetList.invalidate();
        reset();
      },
    });
  function handleExtractToJournal(values: FormValues) {
    mutate(values);
  }

  async function handleSubmit(values: FormValues) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw new Error("No active session");
    }
    if (journalEntry) {
      addTweet({
        text: values.entry,
        profileId: data.session.user.id,
        entry: journalEntry,
      });
    } else {
      addTweet({
        text: values.entry,
        profileId: data.session.user.id,
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <JournalEntryForm
        handleExtractToJournal={handleExtractToJournal}
        isExtracting={isLoading}
        handleSubmit={handleSubmit}
        isSubmitting={isAddingTweet}
      />
      {journalEntry && accounts && (
        <JournalEntryModal accounts={accounts} journalEntry={journalEntry} />
      )}
    </div>
  );
}
