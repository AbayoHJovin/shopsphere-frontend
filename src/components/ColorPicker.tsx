"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface ColorPickerProps {
  colors: Array<{ colorName: string; colorHexCode: string }>;
  onChange: (colors: Array<{ colorName: string; colorHexCode: string }>) => void;
}

export function ColorPicker({ colors, onChange }: ColorPickerProps) {
  const [colorName, setColorName] = useState("");
  const [colorHexCode, setColorHexCode] = useState("#000000");

  const addColor = () => {
    if (colorName.trim() === "") {
      return;
    }

    onChange([...colors, { colorName, colorHexCode }]);
    setColorName("");
    setColorHexCode("#000000");
  };

  const removeColor = (index: number) => {
    onChange(colors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 p-2 border rounded-md"
          >
            <div
              className="h-6 w-6 rounded-md border"
              style={{ backgroundColor: color.colorHexCode }}
            />
            <span>{color.colorName}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={() => removeColor(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="colorName">Color Name</Label>
          <Input
            id="colorName"
            placeholder="e.g. Forest Green"
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            className="border-primary/20 focus-visible:ring-primary"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="colorHex">Color Code</Label>
          <div className="flex space-x-2 items-center">
            <Input
              id="colorHex"
              type="color"
              value={colorHexCode}
              onChange={(e) => setColorHexCode(e.target.value)}
              className="w-12 h-9 p-1 cursor-pointer border-primary/20 focus-visible:ring-primary"
            />
            <Input
              value={colorHexCode}
              onChange={(e) => setColorHexCode(e.target.value)}
              className="flex-1 border-primary/20 focus-visible:ring-primary"
            />
          </div>
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            onClick={addColor}
            className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary"
            disabled={colorName.trim() === ""}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Color
          </Button>
        </div>
      </div>
    </div>
  );
} 