"use client";

import { useCalculator } from "@/hooks/use-calculator";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ProjectionChart } from "@/components/dashboard/ProjectionChart";
import { InputsPanel } from "@/components/dashboard/InputsPanel";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Settings2, LineChart, LayoutDashboard, Share2, Download, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { DEFAULT_INPUTS } from "@/lib/constants";

export default function Home() {
  const { inputs, results, updateInput, importData, isLoaded } = useCalculator();
  const [activeTab, setActiveTab] = useState<"projection" | "details">("projection");

  // Fire confetti only once when state becomes excellent
  useEffect(() => {
    if (results.estado === 'excelente' && isLoaded) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#ffffff']
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [results.estado, isLoaded]);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inputs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "plan_jubilacion.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleReset = () => {
    if (confirm("¿Estás seguro de que quieres resetear todos los valores?")) {
      importData(DEFAULT_INPUTS);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/20">
                <Calculator className="text-white" size={20} />
              </div>
              <div>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  Jubilación Pro
                </span>
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 uppercase tracking-wider">
                  v2.0
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Resetear valores"
              >
                <RotateCcw size={18} />
              </button>
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <Share2 size={18} />
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-700 shadow-lg shadow-black/20"
              >
                <Download size={16} />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Summary Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard size={24} className="text-blue-500" />
              Panel de Control
            </h1>
            <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex gap-1">
              <button 
                onClick={() => setActiveTab("projection")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === "projection" 
                    ? "bg-slate-800 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Proyección
              </button>
              <button 
                onClick={() => setActiveTab("details")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === "details" 
                    ? "bg-slate-800 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Detalles
              </button>
            </div>
          </div>
          
          <SummaryCards results={results} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Settings2 size={18} className="text-blue-500" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                Parámetros de Simulación
              </h2>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 p-1 rounded-2xl">
              <InputsPanel inputs={inputs} updateInput={updateInput} />
            </div>
          </div>

          {/* Right Column - Visuals */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <LineChart size={18} className="text-emerald-500" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                  Visualización de Datos
                </h2>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded uppercase tracking-widest">
                Valores ajustados por inflación
              </span>
            </div>
            
            <AnimatePresence mode="wait">
              {activeTab === "projection" ? (
                <motion.div
                  key="projection"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProjectionChart data={results.tablaAnual} retirementAge={inputs.edadJubilacion} />
                </motion.div>
              ) : (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Año</th>
                          <th className="px-6 py-4 font-semibold">Edad</th>
                          <th className="px-6 py-4 font-semibold text-right">Caja</th>
                          <th className="px-6 py-4 font-semibold text-right">Reserva</th>
                          <th className="px-6 py-4 font-semibold text-right">Rendimiento</th>
                          <th className="px-6 py-4 font-semibold text-right">Gasto Mes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {results.tablaAnual.filter((_, i) => i % 5 === 0 || i === 0 || i === results.tablaAnual.length - 1).map((row) => (
                          <tr key={`${row.ano}-${row.edad}`} className="hover:bg-slate-800/50 transition-colors group">
                            <td className="px-6 py-4 text-slate-300 font-mono group-hover:text-white">{row.ano}</td>
                            <td className="px-6 py-4 text-slate-400">{row.edad} años</td>
                            <td className="px-6 py-4 text-emerald-400 text-right font-mono">
                              ${Math.round(row.capitalCaja).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-blue-400 text-right font-mono">
                              ${Math.round(row.capitalReserva).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-indigo-400 text-right font-mono">
                              +${Math.round(row.rendimientoTotal).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-slate-400 text-right">
                              ${Math.round(row.gastosMensuales || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 bg-slate-950/50 text-center border-t border-slate-800">
                    <p className="text-[10px] text-slate-500 italic uppercase tracking-widest">
                      Mostrando hitos significativos de la proyección lineal
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Insights Placeholder */}
            <motion.div 
              layout
              className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-2xl p-6 flex gap-4 shadow-inner"
            >
              <div className="p-3 h-fit bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/30">
                <Settings2 size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-blue-100 flex items-center gap-2 italic">
                  Análisis del Escenario
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                </h4>
                <p className="text-sm text-blue-300/80 leading-relaxed">
                  Basado en tu tasa de ahorro actual (${inputs.aporteMensualJubilacion}/mes), podrías alcanzar la libertad financiera 
                  {results.retiro.esSuficiente ? " cómodamente" : " con algunos ajustes"}. 
                  Considera aumentar tu tasa de retorno en reserva un 1% para mejorar la seguridad del plan a largo plazo.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 pb-32">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            © 2026 Jubilación Pro v2.0 • Diseñado con precisión financiera
          </p>
          <div className="mt-4 flex justify-center gap-4 text-slate-600">
            <span className="text-[10px] uppercase tracking-tighter">Seguro</span>
            <span className="text-[10px] uppercase tracking-tighter">Privado</span>
            <span className="text-[10px] uppercase tracking-tighter">Código Abierto</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
