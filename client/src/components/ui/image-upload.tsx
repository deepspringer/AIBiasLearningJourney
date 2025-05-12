import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onError?: (error: Error) => void;
}

export function ImageUpload({ value, onChange, onError }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || "");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      onError?.(new Error("Please select an image file"));
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      onError?.(new Error("Image must be less than 5MB"));
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      onChange(data.url);
      setUrlInput(data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      onError?.(error instanceof Error ? error : new Error("Failed to upload image"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Upload Image</label>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Or enter image URL</label>
        <div className="flex gap-2">
          <Input
            type="url"
            value={urlInput}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={handleUrlSubmit}
            variant="outline"
            disabled={!urlInput.trim()}
          >
            Use URL
          </Button>
        </div>
      </div>

      {value && (
        <div className="mt-4 border rounded-md p-2">
          <p className="text-sm font-medium mb-2">Preview</p>
          <img
            src={value}
            alt="Preview"
            className="max-h-[200px] max-w-full object-contain rounded"
          />
        </div>
      )}
    </div>
  );
}