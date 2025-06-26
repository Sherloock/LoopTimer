"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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
    "#f43f5e", // rose
    "#06b6d4", // cyan
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative" ref={dropdownRef}>
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
            <div className="absolute left-0 top-full z-50 mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-lg border bg-background p-3 shadow-lg sm:w-80 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                {/* Header with close button */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Pick a color</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => setIsOpen(false)}
                  >
                    <X size={12} />
                  </Button>
                </div>

                {/* React Colorful Picker */}
                <div className="space-y-2">
                  <div className="w-full [&_.react-colorful]:h-48 [&_.react-colorful]:w-full sm:[&_.react-colorful]:h-56">
                    <HexColorPicker color={value} onChange={onChange} />
                  </div>
                </div>

                {/* Preset colors */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Presets
                  </Label>
                  <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="h-7 w-7 rounded border-2 border-muted transition-all hover:scale-110 hover:border-ring active:scale-95 sm:h-8 sm:w-8"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          onChange(color);
                          setIsOpen(false);
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Hex input */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Hex Color
                  </Label>
                  <Input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (newValue.startsWith("#") || newValue === "") {
                        onChange(newValue);
                      }
                    }}
                    className="font-mono text-sm"
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
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue.startsWith("#") || newValue === "") {
              onChange(newValue);
            }
          }}
          className="flex-1 font-mono text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
