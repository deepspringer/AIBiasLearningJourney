import { useState, useEffect } from "react";
import { Button } from "./button";
import { Switch } from "./switch";
import { Label } from "./label"; 

interface SectionManagerProps {
  contentCount: number;
  sectionIndexes: number[];
  onChange: (indexes: number[]) => void;
}

export function SectionManager({ contentCount, sectionIndexes = [0], onChange }: SectionManagerProps) {
  // Ensure section indexes is an array
  const initialIndexes = Array.isArray(sectionIndexes) ? [...sectionIndexes] : [0];
  const [localIndexes, setLocalIndexes] = useState<number[]>(initialIndexes);

  // Always ensure 0 is included
  useEffect(() => {
    if (!localIndexes.includes(0)) {
      const newIndexes = [0, ...localIndexes].sort((a, b) => a - b);
      setLocalIndexes(newIndexes);
      onChange(newIndexes);
    }
  }, [localIndexes, onChange]);

  // Update when props change
  useEffect(() => {
    if (JSON.stringify(sectionIndexes) !== JSON.stringify(localIndexes)) {
      setLocalIndexes([...sectionIndexes]);
    }
  }, [sectionIndexes]);

  const toggleSectionBreak = (index: number) => {
    let newIndexes = [...localIndexes];

    if (newIndexes.includes(index)) {
      // Remove the index (unless it's 0)
      if (index !== 0) {
        newIndexes = newIndexes.filter(i => i !== index);
      }
    } else {
      // Add the index
      newIndexes.push(index);
      newIndexes.sort((a, b) => a - b);
    }

    setLocalIndexes(newIndexes);

    // Log the new section indexes
    console.log("Section Manager: New section indexes:", newIndexes);

    // Call the onChange callback to update the form value
    onChange(newIndexes);
  };

  // Generate items to display (skip index 0 since it's always a section start)
  const items = Array.from({ length: contentCount > 0 ? contentCount : 1 }, (_, i) => i)
    .filter(i => i > 0); // Skip index 0

  if (items.length === 0) {
    return null; // Nothing to manage if there's only one item
  }

  return (
    <div className="p-4 border rounded-md space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Section Breaks</h3>
        <div className="text-sm text-gray-500">
          First item is always the start of a section
        </div>
      </div>
      
      <div className="space-y-2">
        {items.map(index => (
          <div key={index} className="flex items-center justify-between">
            <Label htmlFor={`section-${index}`} className="flex-1">
              Start new section at item {index + 1}
            </Label>
            <Switch 
              id={`section-${index}`}
              checked={localIndexes.includes(index)}
              onCheckedChange={() => toggleSectionBreak(index)}
            />
          </div>
        ))}
      </div>
      
      <div className="text-sm text-gray-500">
        Current section breaks: {localIndexes.join(', ')}
      </div>
    </div>
  );
}