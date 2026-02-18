"use client";

import { useState, useEffect, useMemo } from "react";
import { CalculatorInputs, FullSimulationResult } from "@/lib/types";
import { RetirementCalculator } from "@/lib/calculator";
import { DEFAULT_INPUTS } from "@/lib/constants";

const STORAGE_KEY = "jubilacion_v2_data";

export function useCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setInputs({ ...DEFAULT_INPUTS, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Error loading saved data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    }
  }, [inputs, isLoaded]);

  const results = useMemo(() => {
    const calc = new RetirementCalculator(inputs);
    return calc.runFullSimulation();
  }, [inputs]);

  const updateInput = (key: keyof CalculatorInputs, value: number | boolean) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const importData = (data: Partial<CalculatorInputs>) => {
    setInputs((prev) => ({ ...prev, ...data }));
  };

  return {
    inputs,
    results,
    updateInput,
    importData,
    isLoaded,
  };
}
