import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";
import { useState } from "react";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({
  label,
  value,
  onChange,
  className = "",
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presetColors = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#6b7280", // gray
    "#000000", // black
    "#ffffff", // white
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative overflow-hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: value }}
            />
            <Palette
              size={16}
              className="relative z-10 text-white mix-blend-difference"
            />
          </Button>

          {isOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 rounded-lg border bg-background p-3 shadow-lg">
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="h-8 w-8 rounded border-2 border-muted hover:border-ring"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        onChange(color);
                        setIsOpen(false);
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-8 w-16 cursor-pointer border-0 p-0"
                  />
                  <Input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
