"use client";

import * as Slider from "@radix-ui/react-slider";
import { Label } from "@radix-ui/react-label";
import { Info } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useState, useEffect, useRef } from "react";

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (val: number) => string;
  suffix?: string;
  tooltip?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onAdjustingChange?: (adjusting: boolean) => void;
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  suffix = "",
  tooltip,
  onMouseEnter,
  onMouseLeave,
  onAdjustingChange
}: SliderInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const displayValue = format ? format(value) : `${value}${suffix}`;

  const handleBlur = () => {
    setIsEditing(false);
    const num = parseFloat(inputValue.replace(',', '.'));
    if (!isNaN(num)) {
      const clamped = Math.max(min, Math.min(max, num));
      onChange(clamped);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue(value.toString());
    }
  };

  return (
    <div 
      className="group relative space-y-3 p-3 -mx-3 rounded-xl transition-all duration-300 hover:bg-blue-600/5 hover:ring-1 hover:ring-blue-500/20"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Subtle highlight indicator */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-500/5 to-transparent transition-opacity duration-500 pointer-events-none" />
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium text-slate-300">
            {label}
          </Label>
          {tooltip && (
            <Tooltip.Provider delayDuration={200}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button className="text-blue-500/70 hover:text-blue-400 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center">
                    <Info size={16} strokeWidth={2} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="z-[100] bg-slate-900 text-slate-200 p-3 rounded-xl text-xs max-w-[240px] shadow-2xl border border-slate-800 leading-relaxed select-none animate-in fade-in zoom-in-95 duration-200"
                    sideOffset={8}
                    side="top"
                    align="center"
                  >
                    <div className="flex items-start gap-2.5">
                      <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                      <span>{tooltip}</span>
                    </div>
                    <Tooltip.Arrow className="fill-slate-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </div>
        
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-20 text-right text-sm font-mono font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/50 outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-sm font-mono font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded transition-all duration-300 hover:bg-blue-500/20 hover:text-blue-300 hover:scale-105 cursor-pointer select-none"
          >
            {displayValue}
          </button>
        )}
      </div>
      
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        max={max}
        min={min}
        step={step}
        onValueChange={(vals) => onChange(vals[0])}
        onPointerDown={() => onAdjustingChange?.(true)}
        onPointerUp={() => onAdjustingChange?.(false)}
      >
        <Slider.Track className="bg-slate-700 relative grow h-[4px] rounded-full">
          <Slider.Range className="absolute bg-blue-500 h-full rounded-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-4 h-4 bg-white shadow-lg rounded-full hover:scale-125 focus:outline-none transition-transform cursor-pointer"
          aria-label={label}
        />
      </Slider.Root>
    </div>
  );
}

