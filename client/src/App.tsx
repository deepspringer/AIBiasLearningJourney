import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AlgorithmicBiasApp from "@/pages/AlgorithmicBiasApp";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Check if user is authenticated by looking for userId in localStorage
    const userId = localStorage.getItem("userId");
    setIsAuthenticated(!!userId);
  }, []);

  // If on protected route, redirect to login
  useEffect(() => {
    // Handle redirections based on auth state
    const currentPath = window.location.pathname;
    if (!isAuthenticated && currentPath !== "/") {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? AlgorithmicBiasApp : LoginPage} />
      <Route path="/app" component={isAuthenticated ? AlgorithmicBiasApp : LoginPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
