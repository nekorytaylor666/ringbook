import { uploadFile } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UseMutateFunction } from "@tanstack/react-query";
import { FileText, Loader2, Paperclip, X } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Skeleton } from "../ui/skeleton"; // Import the Skeleton component
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  entry: z.string().min(2, {
    message: "Entry must be at least 2 characters.",
  }),
  files: z.array(z.any()).optional(),
  fileUrls: z.array(z.string()).optional(),
});

export type FormValues = z.infer<typeof formSchema>;

type JournalEntryFormProps = {
  handleSubmit: (values: FormValues) => void;
  handleExtractToJournal: (values: FormValues) => void;
  isSubmitting: boolean;
  isExtracting: boolean;
};

export function JournalEntryForm({
  handleSubmit,
  isSubmitting,
  handleExtractToJournal,
  isExtracting,
}: JournalEntryFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<
    { file: File; url: string; status: "uploading" | "done" | "error" }[]
  >([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entry: "",
      files: [],
    },
  });

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    noClick: true,
    noKeyboard: true,
    accept: {
      "image/*": [],
      "application/pdf": [".pdf"],
    },
    onDrop: async (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        url: "",
        status: "uploading" as const,
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i].file;
        try {
          const url = await uploadFile(file, "journal-entries");
          if (url) {
            setUploadedFiles((prev) =>
              prev.map((f, index) =>
                index === uploadedFiles.length + i
                  ? { ...f, url, status: "done" as const }
                  : f,
              ),
            );
          } else {
            throw new Error("Failed to upload file");
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          setUploadedFiles((prev) =>
            prev.map((f, index) =>
              index === uploadedFiles.length + i
                ? { ...f, status: "error" as const }
                : f,
            ),
          );
        }
      }

      form.setValue(
        "files",
        [...uploadedFiles, ...newFiles].map((f) => f.file),
      );
    },
  });

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    form.setValue(
      "files",
      newFiles.map((f) => f.file),
    );
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const fileUrls = uploadedFiles
        .filter((f) => f.status === "done")
        .map((f) => f.url);
      await handleSubmit({ ...values, fileUrls });
      form.reset();
      setUploadedFiles([]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      {...getRootProps()}
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Card className="border-none ">
        <CardContent className="p-4">
          <div
            className={`grid w-full gap-1.5 p-1 transition-all duration-100 ${
              isDragActive
                ? "border-2 border-dashed border-primary rounded-lg"
                : ""
            }`}
          >
            <Textarea
              className="border-none shadow-none placeholder:text-lg text-lg placeholder:font-mono border-transparent focus:border-transparent focus:ring-0"
              placeholder="What's happening?!"
              id="message-2"
              {...form.register("entry")}
            />
            <input {...getInputProps()} />
          </div>
          {uploadedFiles.length > 0 && (
            <div className="mt-4 p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploadedFiles.map((file, index) => (
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
                      onClick={() => removeFile(index)}
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
        </CardContent>
        <CardFooter className="flex justify-end p-4 pt-0 gap-2">
          <div className="flex items-center w-full">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={open}
              type="button"
            >
              <Paperclip className="size-4" />
            </Button>
          </div>

          <Button
            onClick={() => handleExtractToJournal(form.getValues())}
            disabled={isExtracting}
            type="button"
            variant="outline"
          >
            {isExtracting ? "Extracting..." : "Extract To Journal"}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
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
