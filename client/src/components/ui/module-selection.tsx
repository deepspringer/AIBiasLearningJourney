
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Module = {
  id: number;
  name: string;
  description: string;
};

interface ModuleSelectionProps {
  onModuleSelect: (moduleId: number) => void;
}

const isAdmin = () => {
  const role = localStorage.getItem("roles");
  console.log("Current user role:", role);
  return role === "admin" || role === "ADMIN"; // Handle case variations
};

export default function ModuleSelection({ onModuleSelect }: ModuleSelectionProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  
  const adminStatus = isAdmin();
  console.log("Admin status check:", adminStatus, "Role from localStorage:", localStorage.getItem("roles"));

  useEffect(() => {
    fetch('/api/modules')
      .then(res => res.json())
      .then(data => {
        setModules(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching modules:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading modules...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Select a Module</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isAdmin() && (
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-dashed border-2"
            onClick={() => window.location.href = "/add-module"}
          >
            <CardHeader>
              <CardTitle>Add New Module</CardTitle>
              <CardDescription>Create a new learning module</CardDescription>
            </CardHeader>
            <CardContent>
              <button 
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 w-full"
              >
                Create Module
              </button>
            </CardContent>
          </Card>
        )}
        {modules.map((module) => (
          <Card 
            key={module.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onModuleSelect(module.id)}
          >
            <CardHeader>
              <CardTitle>{module.name}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <button 
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 w-full"
                onClick={() => onModuleSelect(module.id)}
              >
                Start Module
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
