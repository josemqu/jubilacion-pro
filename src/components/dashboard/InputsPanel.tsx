"use client";

import { SliderInput } from "../ui/slider-input";
import { MonthYearPicker } from "../ui/month-year-picker";
import { CalculatorInputs } from "@/lib/types";
import { motion } from "framer-motion";
import { User, DollarSign, BarChart4, Target, Calendar, Info } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

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
    <div className="flex flex-col gap-6 p-2">
      {/* Vida */}
      <section className={sectionClasses}>
        <div className={headerClasses}>
          <div className={iconClasses}><User size={16} /></div>
          <h3 className={titleClasses}>Parámetros de Vida</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-medium text-slate-300">Fecha de Inicio</label>
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
                    >
                      <div className="flex items-start gap-2.5">
                        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <span>Mes y año para comenzar las proyecciones. Por defecto es hoy.</span>
                      </div>
                      <Tooltip.Arrow className="fill-slate-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
            <MonthYearPicker
              month={inputs.mesInicio}
              year={inputs.anoInicio}
              onChange={(m, y) => {
                updateInput("mesInicio", m);
                updateInput("anoInicio", y);
              }}
            />
          </div>
          <SliderInput
            label="Edad Actual"
            value={inputs.edadActual}
            min={18}
            max={90}
            onChange={(v) => updateInput("edadActual", v)}
            suffix=" años"
            tooltip="Tu edad actual para comenzar los cálculos desde hoy."
          />
          <SliderInput
            label="Edad de Jubilación"
            value={inputs.edadJubilacion}
            min={inputs.edadActual + 1}
            max={90}
            onChange={(v) => updateInput("edadJubilacion", v)}
            suffix=" años"
            tooltip="La edad en la que planeas dejar de trabajar y empezar a usar tus ahorros."
          />
          <SliderInput
            label="Esperanza de Vida"
            value={inputs.esperanzaVida}
            min={inputs.edadJubilacion + 1}
            max={110}
            onChange={(v) => updateInput("esperanzaVida", v)}
            suffix=" años"
            tooltip="Utilizado para calcular hasta qué edad debe durar tu capital."
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
            max={20000}
            step={100}
            onChange={(v) => updateInput("ingresoMensual", v)}
            format={(v) => `$${v.toLocaleString('de-DE')}`}
            tooltip="Tus ingresos netos totales por mes (sueldo, rentas, etc.)."
          />
          <SliderInput
            label="Gasto Mensual"
            value={inputs.gastoMensual}
            min={0}
            max={20000}
            step={100}
            onChange={(v) => updateInput("gastoMensual", v)}
            format={(v) => `$${v.toLocaleString('de-DE')}`}
            tooltip="Tus gastos de vida actuales por mes."
          />
          <SliderInput
            label="Aporte Reserva Jubilación"
            value={inputs.aporteMensualJubilacion}
            min={0}
            max={500}
            step={10}
            onChange={(v) => updateInput("aporteMensualJubilacion", v)}
            format={(v) => `$${v.toLocaleString('de-DE')}`}
            tooltip="Monto que separas específicamente para ahorrar/invertir cada mes."
          />
          <SliderInput
            label="Retiro Deseado"
            value={inputs.gastoMensualDeseado}
            min={inputs.gastoMensual * 0.5}
            max={inputs.gastoMensual * 3}
            step={100}
            onChange={(v) => updateInput("gastoMensualDeseado", v)}
            format={(v) => `$${v.toLocaleString('de-DE')}`}
            tooltip="El nivel de gasto mensual que aspiras tener una vez jubilado (a valores de hoy)."
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
            format={(v) => `$${v.toLocaleString('de-DE')}`}
            tooltip="Dinero en efectivo o cuentas de alta liquidez disponibles hoy."
          />
          <SliderInput
            label="Reserva Actual"
            value={inputs.capitalInicialReserva}
            min={0}
            max={500000}
            step={100}
            onChange={(v) => updateInput("capitalInicialReserva", v)}
            format={(v) => `$${v.toLocaleString('de-DE')}`}
            tooltip="Inversiones, plazos fijos o ahorros de largo plazo que ya posees."
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
            tooltip="Tasa Nominal Anual estimada para tu capital en caja."
          />
          <SliderInput
            label="TNA Reserva"
            value={inputs.tasaRetornoReservaAnual}
            min={0}
            max={30}
            step={0.5}
            onChange={(v) => updateInput("tasaRetornoReservaAnual", v)}
            suffix="%"
            tooltip="Tasa de interés anual esperada para tus inversiones de reserva."
          />
          <SliderInput
            label="Inflación"
            value={inputs.inflacionAnual}
            min={0}
            max={20}
            step={0.1}
            onChange={(v) => updateInput("inflacionAnual", v)}
            suffix="%"
            tooltip="Inflación anual promedio estimada. Afectará el poder de compra futuro."
          />
        </div>
      </section>
    </div>
  );
}
