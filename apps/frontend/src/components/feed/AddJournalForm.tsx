import { uploadFile } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UseMutateFunction } from "@tanstack/react-query";
import { FileText, Loader2, Paperclip, X } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { type UseFormReturn, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Skeleton } from "../ui/skeleton"; // Import the Skeleton component
import { Textarea } from "../ui/textarea";
import type { useTweetForm } from "./useTweetForm";

type JournalEntryFormProps = {
  tweetForm: ReturnType<typeof useTweetForm>;
};

export function JournalEntryForm({ tweetForm }: JournalEntryFormProps) {
  return (
    <div {...tweetForm.getRootProps()} className="flex flex-col gap-4">
      <div
        className={`grid w-full gap-1.5 p-1 transition-all duration-100 ${
          tweetForm.isDragActive
            ? "border-2 border-dashed border-primary rounded-lg"
            : ""
        }`}
      >
        <Textarea
          className="border-none shadow-none placeholder:text-lg text-lg placeholder:font-mono border-transparent focus:border-transparent focus:ring-0"
          placeholder="What's happening?!"
          id="message-2"
          {...tweetForm.form.register("entry")}
        />
        <input {...tweetForm.getInputProps()} />
      </div>
      {tweetForm.uploadedFiles.length > 0 && (
        <div className="mt-4 p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tweetForm.uploadedFiles.map((file, index) => (
            <div key={index} className="relative group">
              {file.status === "uploading" ? (
                <Skeleton className="w-full h-24 rounded-lg" />
              ) : file.file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file.file)}
                  alt={file.file.name}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center">
                  <FileText size={32} className="text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <p className="text-foreground text-xs text-center px-2 truncate">
                  {file.file.name}
                </p>
              </div>
              {file.status !== "uploading" && (
                <button
                  type="button"
                  onClick={() => tweetForm.removeFile(index)}
                  className="absolute top-1 right-1 bg-background rounded-full p-1 shadow-md hover:bg-accent"
                >
                  <X size={16} />
                </button>
              )}
              {file.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
              {file.status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/20">
                  <p className="text-destructive text-sm">Upload failed</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
