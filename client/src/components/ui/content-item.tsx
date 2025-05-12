import { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { ImageUpload } from "./image-upload";
import { useToast } from "@/hooks/use-toast";
import { ContentItem as ContentItemType } from "@shared/schema";
import { Card } from "./card";

interface ContentItemProps {
  value: ContentItemType;
  onChange: (value: ContentItemType) => void;
  onRemove: () => void;
  index: number;
}

export function ContentItem({ value, onChange, onRemove, index }: ContentItemProps) {
  const { toast } = useToast();
  const [contentType, setContentType] = useState<"text" | "image" | "html" | "conclusion">(value.type || "text");
  const previewRef = useRef<HTMLIFrameElement>(null);

  const handleTypeChange = (type: "text" | "image" | "html" | "conclusion") => {
    setContentType(type);
    onChange({
      type,
      content:
        type === "text" ? (value.type === "text" ? value.content : "") :
        type === "image" ? (value.type === "image" ? value.content : "") :
        type === "html" ? (value.type === "html" ? value.content : "") :
        (value.type === "conclusion" ? value.content : ""),
      instructions: type === "conclusion" ?
        (value.type === "conclusion" ? value.instructions : "Write your conclusion based on what you've learned.") :
        undefined
    });
  };

  const handleContentChange = (content: string) => {
    onChange({
      type: contentType,
      content,
      instructions: contentType === "conclusion" ? value.instructions : undefined
    });
  };

  const handleInstructionsChange = (instructions: string) => {
    if (contentType === "conclusion") {
      onChange({
        type: contentType,
        content: value.content,
        instructions
      });
    }
  };

  const handleImageError = (error: Error) => {
    toast({
      title: "Image Upload Error",
      description: error.message,
      variant: "destructive",
    });
  };

  // Auto-update HTML preview when content changes or type changes
  useEffect(() => {
    if (contentType === "html" && previewRef.current) {
      try {
        const doc = previewRef.current.contentDocument;
        if (doc) {
          doc.open();
          doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  margin: 0;
                  padding: 10px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                * { box-sizing: border-box; }
              </style>
            </head>
            <body>
              ${value.type === "html" ? value.content : ""}
            </body>
          </html>
          `);
          doc.close();
        }
      } catch (error) {
        console.error("Error updating preview:", error);
      }
    }
  }, [contentType, value.content, value.type]);

  return (
    <div className="border rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">Item {index + 1}</div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRemove}
          className="text-destructive hover:text-destructive/90"
        >
          Remove
        </Button>
      </div>
      
      <div className="flex space-x-2 flex-wrap gap-2">
        <Button
          type="button"
          variant={contentType === "text" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTypeChange("text")}
        >
          Text
        </Button>
        <Button
          type="button"
          variant={contentType === "image" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTypeChange("image")}
        >
          Image
        </Button>
        <Button
          type="button"
          variant={contentType === "html" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTypeChange("html")}
        >
          HTML
        </Button>
        <Button
          type="button"
          variant={contentType === "conclusion" ? "default" : "outline"}
          size="sm"
          onClick={() => handleTypeChange("conclusion")}
        >
          Conclusion
        </Button>
      </div>

      {contentType === "text" ? (
        <Textarea
          value={value.type === "text" ? value.content : ""}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Enter text content here..."
          className="min-h-[150px]"
        />
      ) : contentType === "image" ? (
        <ImageUpload
          value={value.type === "image" ? value.content : ""}
          onChange={handleContentChange}
          onError={handleImageError}
        />
      ) : contentType === "html" ? (
        <div className="space-y-4">
          <Textarea
            value={value.type === "html" ? value.content : ""}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Enter HTML content here..."
            className="min-h-[150px] font-mono text-sm"
          />

          <div className="border rounded-md p-2">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">HTML Preview</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (previewRef.current) {
                    try {
                      const doc = previewRef.current.contentDocument;
                      if (doc) {
                        doc.open();
                        doc.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                            <style>
                              body {
                                margin: 0;
                                padding: 10px;
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                              }
                              * { box-sizing: border-box; }
                            </style>
                          </head>
                          <body>
                            ${value.type === "html" ? value.content : ""}
                          </body>
                        </html>
                        `);
                        doc.close();
                      }
                    } catch (error) {
                      console.error("Error updating preview:", error);
                    }
                  }
                }}
              >
                Refresh Preview
              </Button>
            </div>
            <div className="relative" style={{ height: '200px' }}>
              <iframe
                ref={previewRef}
                title="HTML Preview"
                className="absolute inset-0 w-full h-full border-0"
                sandbox="allow-scripts allow-forms"
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <style>
                        body {
                          margin: 0;
                          padding: 10px;
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        }
                        * { box-sizing: border-box; }
                      </style>
                    </head>
                    <body>
                      ${value.type === "html" ? value.content : ""}
                    </body>
                  </html>
                `}
              />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Note: The preview may not show all interactivity. Sandbox restrictions apply.
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Conclusion interface
        <div className="space-y-4 border border-green-200 rounded-md p-4 bg-green-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions for Students
            </label>
            <Textarea
              value={value.type === "conclusion" ? value.instructions || "" : ""}
              onChange={(e) => handleInstructionsChange(e.target.value)}
              placeholder="Enter instructions for students writing their conclusion..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Editor Template (Optional)
            </label>
            <Textarea
              value={value.type === "conclusion" ? value.content : ""}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Enter an optional template or placeholder for the student's conclusion..."
              className="min-h-[150px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be the initial text in the student's conclusion editor. Leave blank for an empty editor.
            </p>
          </div>

          <div className="border rounded-md p-2 bg-white">
            <div className="mb-2">
              <h4 className="text-sm font-medium">Preview: Conclusion Interface</h4>
            </div>

            <div className="border-t pt-3">
              <div className="space-y-4">
                <p className="text-gray-700">
                  {value.type === "conclusion" ? value.instructions || "Write your conclusion..." : "Write your conclusion..."}
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Your Conclusion
                  </label>
                  <div className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border min-h-[120px] bg-gray-50">
                    {value.type === "conclusion" && value.content ? value.content : "Students will write their conclusion here..."}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    disabled
                    className="px-4 py-2 bg-green-500 text-white rounded-md opacity-70 cursor-not-allowed flex items-center"
                  >
                    <span className="mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                    </span>
                    Save Conclusion
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Note: When students use this interface, their conclusions will be saved to the database and can be reviewed later.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}