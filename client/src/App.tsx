import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AlgorithmicBiasApp from "@/pages/AlgorithmicBiasApp";
import LoginPage from "@/pages/LoginPage";
import AddModulePage from "@/pages/AddModulePage";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [location, setLocation] = useLocation();
  
  // Force a re-check of authentication when location changes
  useEffect(() => {
    // Check if user is authenticated by looking for userId in localStorage
    const userId = localStorage.getItem("userId");
    setIsAuthenticated(!!userId);
    
    console.log("Auth check:", !!userId, "at path:", location);
  }, [location]);

  // We've simplified the routing, so we no longer need this redirection logic
  // Keeping the authentication check in the component rendering instead

  // Determine which component to render based on authentication
  const MainApp = isAuthenticated ? AlgorithmicBiasApp : LoginPage;
  
  return (
    <Switch>
      <Route path="/" component={MainApp} />
      <Route path="/add-module" component={isAuthenticated ? AddModulePage : LoginPage} />
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
