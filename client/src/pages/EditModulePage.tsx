
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContentItem } from "@/components/ui/content-item";
import { SectionManager } from "@/components/ui/section-manager";
import { useToast } from "@/hooks/use-toast";
import { ContentItem as ContentItemType } from "@shared/schema";

const contentItemSchema = z.object({
  type: z.enum(["text", "image", "html", "conclusion"]),
  content: z.string().min(1, "Content is required"),
  instructions: z.string().optional(),
});

const moduleSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  text: z.array(contentItemSchema).min(1, "At least one content item is required"),
  section_indexes: z.array(z.number()).default([0]),
  system_prompt_read: z.string().min(10, "Reading prompt must be at least 10 characters"),
  experiment_html: z.string().min(10, "Experiment HTML must be at least 10 characters"),
  system_prompt_experiment: z.string().min(10, "Experiment prompt must be at least 10 characters"),
  conclude_text: z.string().min(10, "Conclusion text must be at least 10 characters"),
  system_prompt_conclude: z.string().min(10, "Conclusion prompt must be at least 10 characters"),
});

type ModuleFormValues = z.infer<typeof moduleSchema>;

export default function EditModulePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const [contentItems, setContentItems] = useState<ContentItemType[]>([
    { type: "text", content: "" }
  ]);
  const [sectionIndexes, setSectionIndexes] = useState<number[]>([0]);

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
  });

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await fetch(`/api/modules/${id}`);
        if (!response.ok) throw new Error("Failed to fetch module");
        const module = await response.json();
        
        // Ensure text content is in the correct format for our form
        const formattedText = Array.isArray(module.text)
          ? module.text.map(item => {
              // Handle cases where the module.text might be just an array of strings from old format
              if (typeof item === 'string') {
                return { type: 'text', content: item };
              }
              // Make sure each item has the required type property
              return {
                type: item.type || 'text',
                content: item.content || ''
              };
            })
          : [{ type: 'text', content: '' }];

        form.reset({
          name: module.name,
          description: module.description,
          text: formattedText,
          system_prompt_read: module.systemPromptRead,
          experiment_html: module.experimentHtml,
          system_prompt_experiment: module.systemPromptExperiment,
          conclude_text: module.concludeText,
          system_prompt_conclude: module.systemPromptConclude,
        });

        setContentItems(formattedText);

        // Handle section indexes
        console.log("Module section indexes:", module.sectionIndexes);
        const moduleIndexes = Array.isArray(module.sectionIndexes) ? module.sectionIndexes : [0];
        setSectionIndexes(moduleIndexes);
        form.setValue("section_indexes", moduleIndexes);
        setIsLoading(false);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch module",
          variant: "destructive",
        });
        setLocation("/");
      }
    };

    if (!isAdmin()) {
      toast({
        title: "Error",
        description: "You don't have permission to edit modules",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }

    fetchModule();
  }, [id, setLocation, toast, form]);

  async function onSubmit(data: ModuleFormValues) {
    setIsSubmitting(true);

    try {
      // Add logging to see what we're sending
      console.log("Submitting module data:", JSON.stringify(data, null, 2));
      console.log("Section indexes to save:", data.section_indexes);

      const response = await fetch(`/api/modules/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Failed to update module: ${response.status} ${response.statusText}`);
      }

      toast({
        title: "Success",
        description: "Module updated successfully",
      });

      setLocation("/");
    } catch (error) {
      console.error("Error updating module:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update module",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Module</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel>Module Content</FormLabel>
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItems = [...contentItems, { type: "text", content: "" }];
                        setContentItems(newItems);
                        form.setValue("text", newItems);
                      }}
                    >
                      Add Text
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItems = [...contentItems, { type: "image", content: "" }];
                        setContentItems(newItems);
                        form.setValue("text", newItems);
                      }}
                    >
                      Add Image
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItems = [...contentItems, { type: "html", content: "" }];
                        setContentItems(newItems);
                        form.setValue("text", newItems);
                      }}
                    >
                      Add HTML
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItems = [...contentItems, {
                          type: "conclusion",
                          content: "",
                          instructions: "Write your conclusion based on what you've learned."
                        }];
                        setContentItems(newItems);
                        form.setValue("text", newItems);
                      }}
                    >
                      Add Conclusion
                    </Button>
                  </div>
                </div>

                {contentItems.map((item, index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={`text.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ContentItem
                            index={index}
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              const newItems = [...contentItems];
                              newItems[index] = value;
                              setContentItems(newItems);
                            }}
                            onRemove={() => {
                              if (contentItems.length <= 1) {
                                toast({
                                  title: "Cannot remove",
                                  description: "You need at least one content item",
                                  variant: "destructive",
                                });
                                return;
                              }

                              const newItems = contentItems.filter((_, i) => i !== index);
                              setContentItems(newItems);
                              form.setValue("text", newItems);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <div className="mt-8">
                  <h3 className="text-base font-medium mb-2">Section Management</h3>
                  <SectionManager
                    contentCount={contentItems.length}
                    sectionIndexes={sectionIndexes}
                    onChange={(indexes) => {
                      setSectionIndexes(indexes);
                      form.setValue("section_indexes", indexes);
                    }}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="system_prompt_read"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reading System Prompt</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experiment_html"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experiment HTML</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="system_prompt_experiment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experiment System Prompt</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conclude_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conclusion Text</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="system_prompt_conclude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conclusion System Prompt</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function isAdmin() {
  const roles = localStorage.getItem("roles");
  return roles?.includes("admin") || false;
}
