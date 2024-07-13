import { uploadFile } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  entry: z.string().min(2, {
    message: "Entry must be at least 2 characters.",
  }),
  files: z.array(z.any()).optional(),
  fileUrls: z.array(z.string()).optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export function useTweetForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entry: "",
      files: [],
    },
  });

  const [uploadedFiles, setUploadedFiles] = useState<
    { file: File; url: string; status: "uploading" | "done" | "error" }[]
  >([]);

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

  const reset = () => {
    form.reset();
    setUploadedFiles([]);
  };

  return {
    uploadedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    removeFile,
    form,
    open,
    reset,
  };
}
