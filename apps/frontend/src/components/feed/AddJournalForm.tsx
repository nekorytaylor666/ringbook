import { zodResolver } from "@hookform/resolvers/zod";
import type { UseMutateFunction } from "@tanstack/react-query";
import { FileText, Loader2, Paperclip, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Textarea } from "../ui/textarea";
const formSchema = z.object({
  entry: z.string().min(2, {
    message: "Entry must be at least 2 characters.",
  }),
  files: z.array(z.any()).optional(),
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
    onDrop: (acceptedFiles) => {
      const currentFiles = form.getValues("files") || [];
      form.setValue("files", [...currentFiles, ...acceptedFiles]);
    },
  });

  const removeFile = (index: number) => {
    const currentFiles = form.getValues("files") || [];
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);
    form.setValue("files", newFiles);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await handleSubmit(values);
      form.reset();
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
          {form.watch("files")?.length > 0 && (
            <div className="mt-4 p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {form.watch("files").map((file: File, index: number) => (
                <div key={index} className="relative group">
                  {file.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center">
                      <FileText size={32} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-foreground text-xs text-center px-2 truncate">
                      {file.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-background rounded-full p-1 shadow-md hover:bg-accent"
                  >
                    <X size={16} />
                  </button>
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
