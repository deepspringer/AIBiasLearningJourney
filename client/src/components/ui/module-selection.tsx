import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Module = {
  id: number;
  name: string;
  description: string;
  text: string; // Added text property
};

interface ModuleSelectionProps {
  onModuleSelect: (module: Module) => void; //Updated parameter type
}

const isAdmin = () => {
  const role = localStorage.getItem("roles");
  return role === "admin" || role === "ADMIN"; // Handle case variations
};

export default function ModuleSelection({ onModuleSelect }: ModuleSelectionProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const adminStatus = isAdmin();

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
            onClick={() => onModuleSelect(module)} // Pass entire module object
          >
            <CardHeader className="relative">
              {adminStatus && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/edit-module/${module.id}`;
                  }}
                  className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full"
                  title="Edit Module"
                >
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
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                </button>
              )}
              <CardTitle>{module.name}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <button 
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 w-full"
                onClick={() => onModuleSelect(module)} // Pass entire module object
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