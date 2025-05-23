import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { initUserActivity } from "@/lib/userActivity";

const loginSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      displayName: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: data.displayName,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Login failed");
      }
      
      const result = await response.json();

      localStorage.setItem("userId", result.id.toString());
      localStorage.setItem("displayName", data.displayName);
      
      // initialize user activity
      initUserActivity(result.id.toString(), data.displayName)

      toast({
        title: "Welcome!",
        description: `You've signed in as ${data.displayName}`,
      });

      // Navigate to the main application directly by using window.location
      // This forces a full page refresh which will properly re-initialize the app with the authenticated state
      window.location.href = "/";
      
      // For safety, also set the router location
      setLocation("/");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "There was a problem signing you in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Algorithmic Bias Explorer</CardTitle>
          <CardDescription className="text-center">
            Enter your name to start exploring algorithmic bias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Start Exploring"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          <p>Your data will be used for educational purposes only</p>
        </CardFooter>
      </Card>
    </div>
  );
}