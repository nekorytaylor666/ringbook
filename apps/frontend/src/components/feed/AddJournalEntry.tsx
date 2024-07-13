import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Paperclip } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { JournalEntry } from "../../../../backend/src/lib/extractJournalEntry";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { JournalEntryForm } from "./AddJournalForm";
import { JournalEntryModal } from "./journalEntry";
import { useJournalEntryForm } from "./journalEntry/useJournalEntryForm";
import { useJournalEntryMutation } from "./useJournalEntryMutation";
import { type FormValues, useTweetForm } from "./useTweetForm";

export function AddJournalEntry() {
  const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);
  const { data: accounts } = trpc.getAccounts.useQuery();
  const utils = trpc.useUtils();

  const tweetForm = useTweetForm();
  const {
    mutate,
    isLoading: isExtracting,
    reset,
  } = useJournalEntryMutation({
    onSuccess(journalEntry) {
      setJournalEntry(journalEntry);
      console.log(journalEntry);
    },
  });
  const { mutate: addTweet, isLoading: isAddingTweet } =
    trpc.addTweet.useMutation({
      onSuccess() {
        toast.success("Tweet added");
        utils.tweetList.invalidate();
        setJournalEntry(null);
        tweetForm.reset();
        reset();
      },
    });
  function handleExtractToJournal(values: FormValues) {
    mutate(values);
  }

  async function onSubmit(values: FormValues) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw new Error("No active session");
    }
    if (journalEntry) {
      addTweet({
        text: values.entry,
        profileId: data.session.user.id,
        entry: journalEntry,
        fileUrls: tweetForm.uploadedFiles.map((file) => file.url),
      });
    } else {
      addTweet({
        text: values.entry,
        profileId: data.session.user.id,
        fileUrls: tweetForm.uploadedFiles.map((file) => file.url),
      });
    }
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={tweetForm.form.handleSubmit(onSubmit)}
    >
      <Card className="border-none">
        <CardContent className="p-4 pb-0">
          <div className="flex flex-col gap-2">
            <JournalEntryForm tweetForm={tweetForm} />
            {journalEntry && accounts && (
              <JournalEntryModal
                onEntryChange={(entries) => {
                  setJournalEntry({ ...journalEntry, entries });
                }}
                journalEntry={journalEntry}
                accounts={accounts}
              />
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-4 pt-0 p-4">
          <div className="flex items-center w-full">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={tweetForm.open}
              type="button"
            >
              <Paperclip className="size-4" />
            </Button>
          </div>

          <Button
            onClick={() => handleExtractToJournal(tweetForm.form.getValues())}
            type="button"
            disabled={isExtracting}
            variant="outline"
          >
            {isExtracting ? "Extracting..." : "Extract To Journal"}
          </Button>
          <Button type="submit" disabled={isAddingTweet || isExtracting}>
            {isAddingTweet ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Post"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
