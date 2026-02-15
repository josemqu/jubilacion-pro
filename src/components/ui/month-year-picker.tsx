"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MonthYearPickerProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
  className?: string;
}

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

const FULL_MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function MonthYearPicker({ month, year, onChange, className }: MonthYearPickerProps) {
  const [viewYear, setViewYear] = React.useState(year);
  const [isOpen, setIsOpen] = React.useState(false);

  // Update viewYear when prop year changes (if closed)
  React.useEffect(() => {
    if (!isOpen) setViewYear(year);
  }, [year, isOpen]);

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-200 transition-all hover:bg-slate-800/80 hover:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-blue-500" />
            <span className="font-medium">
              {FULL_MONTHS[month]} {year}
            </span>
          </div>
        </button>
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="start"
          className="z-[100] w-64 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewYear(v => v - 1)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold text-slate-200 tracking-tight">
              {viewYear}
            </span>
            <button
              onClick={() => setViewYear(v => v + 1)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((m, i) => {
              const isSelected = i === month && viewYear === year;
              const isCurrentView = i === month;

              return (
                <button
                  key={m}
                  onClick={() => {
                    onChange(i, viewYear);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "h-10 rounded-lg text-xs font-medium transition-all",
                    isSelected 
                      ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  )}
                >
                  {m}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-center">
             <button 
              onClick={() => {
                const now = new Date();
                onChange(now.getMonth(), now.getFullYear());
                setIsOpen(false);
              }}
              className="text-[10px] uppercase tracking-widest font-bold text-blue-500 hover:text-blue-400 transition-colors"
             >
                Ir a hoy
             </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
