"use client";

import * as Slider from "@radix-ui/react-slider";
import { Label } from "@radix-ui/react-label";
import { Info } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

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
}: SliderInputProps) {
  const displayValue = format ? format(value) : `${value}${suffix}`;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-medium text-slate-300">
            {label}
          </Label>
          {tooltip && (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button className="text-slate-500 hover:text-slate-300 transition-colors">
                    <Info size={14} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-slate-800 text-white p-2 rounded text-xs max-w-xs shadow-xl border border-slate-700"
                    sideOffset={5}
                  >
                    {tooltip}
                    <Tooltip.Arrow className="fill-slate-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </div>
        <span className="text-sm font-mono font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
          {displayValue}
        </span>
      </div>
      
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        max={max}
        min={min}
        step={step}
        onValueChange={(vals) => onChange(vals[0])}
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
