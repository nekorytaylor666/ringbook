import { FileText, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { type Control, useController } from "react-hook-form";

interface UploadZoneProps {
  name: string;
  control: Control<any>;
}

interface FilePreview {
  url: string;
  name: string;
  type: string;
}

const UploadZone: React.FC<UploadZoneProps> = ({ name, control }) => {
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const { field } = useController({ name, control });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
      "application/pdf": [".pdf"],
    },
    multiple: true,
    onDrop: (acceptedFiles) => {
      field.onChange(acceptedFiles);
      setPreviews(
        acceptedFiles.map((file) => ({
          url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
          name: file.name,
          type: file.type,
        })),
      );
    },
  });

  const removeFile = (index: number) => {
    const newFiles = [...field.value];
    newFiles.splice(index, 1);
    field.onChange(newFiles);

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-input rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors"
      >
        <input {...getInputProps()} />
        <p className="text-muted-foreground">
          Drag & drop files here, or click to select files
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Supports PDF and image files
        </p>
      </div>
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              {preview.type.startsWith("image/") ? (
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-24 bg-muted rounded-lg flex items-center justify-center">
                  <FileText size={32} className="text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <p className="text-foreground text-xs text-center px-2 truncate">
                  {preview.name}
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
    </div>
  );
};

export default UploadZone;
