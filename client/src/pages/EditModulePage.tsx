
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
import { useToast } from "@/hooks/use-toast";

const moduleSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  text: z.array(z.string()).min(1, "At least one text paragraph is required"),
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
  const [paragraphCount, setParagraphCount] = useState(1);

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
  });

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await fetch(`/api/modules/${id}`);
        if (!response.ok) throw new Error("Failed to fetch module");
        const module = await response.json();
        
        form.reset({
          name: module.name,
          description: module.description,
          text: module.text,
          system_prompt_read: module.systemPromptRead,
          experiment_html: module.experimentHtml,
          system_prompt_experiment: module.systemPromptExperiment,
          conclude_text: module.concludeText,
          system_prompt_conclude: module.systemPromptConclude,
        });
        
        setParagraphCount(module.text.length);
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
      const response = await fetch(`/api/modules/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update module");
      }

      toast({
        title: "Success",
        description: "Module updated successfully",
      });

      setLocation("/");
    } catch (error) {
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
                <FormLabel>Module Text Paragraphs</FormLabel>
                {Array.from({ length: paragraphCount }).map((_, index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={`text.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paragraph {index + 1}</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setParagraphCount(prev => prev + 1)}
                >
                  Add Paragraph
                </Button>
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
