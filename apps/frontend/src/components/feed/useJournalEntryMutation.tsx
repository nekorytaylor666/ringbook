import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { JournalEntry } from "../../../../backend/src/lib/extractJournalEntry";
import type { FormValues } from "./AddJournalForm";

export function useJournalEntryMutation() {
  const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);

  const mutation = async (values: FormValues) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw new Error("No active session");
    }

    const formData = new FormData();
    formData.append("entry", values.entry);
    formData.append("profileId", data.session.user.id);

    if (values.files && values.files.length > 0) {
      values.files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
    }

    const response = await fetch(
      "https://backend.ringbook.io/api/journal/generate",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to submit journal entry");
    }

    const result = await response.json();
    return result;
  };

  const reset = () => {
    setJournalEntry(null);
  };

  const { mutate, isLoading } = useMutation(mutation, {
    onSuccess: (data) => {
      setJournalEntry(data.journalEntry);
      toast.success("Journal entry submitted successfully");
    },
    onError: (error) => {
      console.error("Error submitting journal entry:", error);
      toast.error("Failed to submit journal entry");
    },
  });

  return { mutate, isLoading, journalEntry, reset };
}
