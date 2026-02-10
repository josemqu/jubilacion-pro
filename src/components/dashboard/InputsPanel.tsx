"use client";

import { SliderInput } from "../ui/slider-input";
import { CalculatorInputs } from "@/lib/types";
import { motion } from "framer-motion";
import { User, DollarSign, BarChart4, Target } from "lucide-react";

interface InputsPanelProps {
  inputs: CalculatorInputs;
  updateInput: (key: keyof CalculatorInputs, value: number) => void;
}

export function InputsPanel({ inputs, updateInput }: InputsPanelProps) {
  const sectionClasses = "bg-slate-900/50 border border-slate-800/50 p-6 rounded-2xl space-y-6";
  const headerClasses = "flex items-center gap-2 mb-2";
  const iconClasses = "p-1.5 bg-slate-800 rounded-md text-slate-400";
  const titleClasses = "text-sm font-bold text-slate-400 uppercase tracking-wider";

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Vida */}
      <section className={sectionClasses}>
        <div className={headerClasses}>
          <div className={iconClasses}><User size={16} /></div>
          <h3 className={titleClasses}>Parámetros de Vida</h3>
        </div>
        <div className="space-y-4">
          <SliderInput
            label="Edad Actual"
            value={inputs.edadActual}
            min={18}
            max={90}
            onChange={(v) => updateInput("edadActual", v)}
            suffix=" años"
          />
          <SliderInput
            label="Edad de Jubilación"
            value={inputs.edadJubilacion}
            min={inputs.edadActual + 1}
            max={90}
            onChange={(v) => updateInput("edadJubilacion", v)}
            suffix=" años"
          />
          <SliderInput
            label="Esperanza de Vida"
            value={inputs.esperanzaVida}
            min={inputs.edadJubilacion + 1}
            max={110}
            onChange={(v) => updateInput("esperanzaVida", v)}
            suffix=" años"
          />
        </div>
      </section>

      {/* Finanzas */}
      <section className={sectionClasses}>
        <div className={headerClasses}>
          <div className={iconClasses}><DollarSign size={16} /></div>
          <h3 className={titleClasses}>Flujo Mensual</h3>
        </div>
        <div className="space-y-4">
          <SliderInput
            label="Ingreso Mensual"
            value={inputs.ingresoMensual}
            min={0}
            max={100000}
            step={100}
            onChange={(v) => updateInput("ingresoMensual", v)}
            format={(v) => `$${v.toLocaleString()}`}
          />
          <SliderInput
            label="Gasto Mensual"
            value={inputs.gastoMensual}
            min={0}
            max={100000}
            step={100}
            onChange={(v) => updateInput("gastoMensual", v)}
            format={(v) => `$${v.toLocaleString()}`}
          />
          <SliderInput
            label="Aporte a Reserva"
            value={inputs.aporteMensualJubilacion}
            min={0}
            max={50000}
            step={50}
            onChange={(v) => updateInput("aporteMensualJubilacion", v)}
            format={(v) => `$${v.toLocaleString()}`}
          />
        </div>
      </section>

      {/* Capital Inicial */}
      <section className={sectionClasses}>
        <div className={headerClasses}>
          <div className={iconClasses}><BarChart4 size={16} /></div>
          <h3 className={titleClasses}>Capital Inicial</h3>
        </div>
        <div className="space-y-4">
          <SliderInput
            label="Capital de Caja"
            value={inputs.capitalInicialCaja}
            min={0}
            max={1000000}
            step={5000}
            onChange={(v) => updateInput("capitalInicialCaja", v)}
            format={(v) => `$${v.toLocaleString()}`}
          />
          <SliderInput
            label="Reserva Actual"
            value={inputs.capitalInicialReserva}
            min={0}
            max={1000000}
            step={5000}
            onChange={(v) => updateInput("capitalInicialReserva", v)}
            format={(v) => `$${v.toLocaleString()}`}
          />
        </div>
      </section>

      {/* Mercado */}
      <section className={sectionClasses}>
        <div className={headerClasses}>
          <div className={iconClasses}><Target size={16} /></div>
          <h3 className={titleClasses}>Economía (%)</h3>
        </div>
        <div className="space-y-4">
          <SliderInput
            label="TNA Caja"
            value={inputs.tasaRetornoCajaAnual}
            min={0}
            max={30}
            step={0.5}
            onChange={(v) => updateInput("tasaRetornoCajaAnual", v)}
            suffix="%"
          />
          <SliderInput
            label="TNA Reserva"
            value={inputs.tasaRetornoReservaAnual}
            min={0}
            max={30}
            step={0.5}
            onChange={(v) => updateInput("tasaRetornoReservaAnual", v)}
            suffix="%"
          />
          <SliderInput
            label="Inflación"
            value={inputs.inflacionAnual}
            min={0}
            max={20}
            step={0.1}
            onChange={(v) => updateInput("inflacionAnual", v)}
            suffix="%"
          />
          <SliderInput
            label="Retiro Deseado"
            value={inputs.gastoMensualDeseado}
            min={inputs.gastoMensual * 0.5}
            max={inputs.gastoMensual * 3}
            step={100}
            onChange={(v) => updateInput("gastoMensualDeseado", v)}
            format={(v) => `$${v.toLocaleString()}`}
          />
        </div>
      </section>
    </div>
  );
}
