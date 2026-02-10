"use client";

import { useCalculator } from "@/hooks/use-calculator";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ProjectionChart } from "@/components/dashboard/ProjectionChart";
import { InputsPanel } from "@/components/dashboard/InputsPanel";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Settings2, LineChart, LayoutDashboard, Share2, Download, Upload, RotateCcw, X, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import confetti from "canvas-confetti";
import { DEFAULT_INPUTS } from "@/lib/constants";

function NavButtonTooltip({ children, content }: { children: React.ReactNode; content: string }) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-[100] bg-slate-900 text-slate-200 p-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-2xl border border-slate-800 leading-none select-none animate-in fade-in zoom-in-95 duration-200"
            sideOffset={8}
            side="bottom"
          >
            {content}
            <Tooltip.Arrow className="fill-slate-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export default function Home() {
  const { inputs, results, updateInput, importData, isLoaded } = useCalculator();
  const [activeTab, setActiveTab] = useState<"projection" | "details">("projection");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    onConfirm: () => void;
    variant: "info" | "danger" | "warning";
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "",
    onConfirm: () => {},
    variant: "info"
  });

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
    setModalConfig({
      isOpen: true,
      title: "Guardar Plan Actual",
      description: "Se va a descargar un archivo con la configuración completa de tu plan actual para que puedas volver a cargarlo más tarde. ¿Deseas proceder?",
      confirmText: "Descargar Archivo",
      variant: "info",
      onConfirm: () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inputs, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `plan_jubilacion_${results.estado}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }
    });
  };

  const handleReset = () => {
    setModalConfig({
      isOpen: true,
      title: "Confirmar Reinicio",
      description: "⚠ ADVERTENCIA: Se restablecerán todos los valores a los parámetros por defecto. Perderás cualquier cambio realizado en la sesión actual. ¿Deseas continuar?",
      confirmText: "Reiniciar Todo",
      variant: "danger",
      onConfirm: () => {
        importData(DEFAULT_INPUTS);
      }
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setModalConfig({
      isOpen: true,
      title: "Cargar Nuevo Plan",
      description: "Los datos del archivo seleccionado reemplazarán por completo tu configuración y proyecciones actuales. Esta acción no se puede deshacer.",
      confirmText: "Importar Datos",
      variant: "warning",
      onConfirm: () => {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target?.result as string);
            importData(json);
          } catch (error) {
            alert("Error al importar el archivo. Asegúrate de que sea un JSON válido.");
          }
        };
        reader.readAsText(file);
      }
    });
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="h-16 flex-shrink-0 z-50 border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-md">
        <div className="px-4 h-full flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors lg:hidden"
              aria-label={isSidebarOpen ? "Cerrar parámetros" : "Abrir parámetros"}
            >
              <Settings2 size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-2xl" aria-hidden="true">
                <img src="/icon.png" alt="Logo Jubilación Pro" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  Jubilación Pro
                </span>
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 uppercase tracking-wider">
                  v2.0
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">

            
            <NavButtonTooltip content="Resetear plan">
              <button 
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                aria-label="Reiniciar todos los valores del simulador"
              >
                <RotateCcw size={18} />
              </button>
            </NavButtonTooltip>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImport} 
              accept=".json" 
              className="hidden" 
            />
            
            <NavButtonTooltip content="Importar JSON">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Importar plan desde archivo JSON"
              >
                <Download size={18} />
              </button>
            </NavButtonTooltip>

            <NavButtonTooltip content="Guardar Plan">
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white rounded-lg transition-all border border-blue-500 shadow-lg shadow-blue-900/20 active:scale-95 ml-2"
              >
                <Upload size={16} />
                <span className="hidden sm:inline uppercase tracking-tighter">Exportar</span>
              </button>
            </NavButtonTooltip>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Parameters */}
        <motion.aside 
          initial={false}
          animate={{ 
            width: isSidebarOpen ? 380 : 0,
            opacity: isSidebarOpen ? 1 : 0,
            x: isSidebarOpen ? 0 : -380
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="h-full border-r border-slate-800 bg-slate-950/20 backdrop-blur-sm overflow-hidden shrink-0 hidden lg:block"
        >
          <div className="w-[380px] h-full flex flex-col pt-6 px-4">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-xs text-slate-500">
                <Settings2 size={16} className="text-blue-500" />
                <span>Parámetros de Simulación</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
                aria-label="Cerrar panel lateral"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
              <InputsPanel inputs={inputs} updateInput={updateInput} />
            </div>
          </div>
        </motion.aside>

        {/* Floating Toggle Button (visible when sidebar is closed) */}
        {!isSidebarOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 bottom-4 z-40 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl shadow-blue-500/40 transition-transform hover:scale-110 hidden lg:flex items-center gap-2"
          >
            <Settings2 size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">Ajustar Plan</span>
            <ChevronRight size={16} />
          </motion.button>
        )}

        {/* Main Dashboard Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/40">
          <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500 flex items-center gap-3">
                  <LayoutDashboard size={28} className="text-blue-500" />
                  Estado de tu Retiro
                </h1>
                <p className="text-slate-500 text-sm mt-1">Análisis detallado basado en tus parámetros actuales.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-700/50">
                  Valores ajustados <span className="text-slate-400">por inflación</span>
                </span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                  results.estado === 'excelente' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  results.estado === 'alcanzable' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}>
                  Status: {results.estado}
                </span>
              </div>
            </div>

            {/* Top Stats */}
            <SummaryCards results={results} />

            {/* Visuals Rendering */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <LineChart size={18} className="text-blue-500" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Proyección de Patrimonio
                  </h2>
                </div>

                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800/50 backdrop-blur-sm">
                  <button 
                    onClick={() => setActiveTab("projection")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      activeTab === "projection" 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Gráfico
                  </button>
                  <button 
                    onClick={() => setActiveTab("details")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      activeTab === "details" 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Tabla
                  </button>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {activeTab === "projection" ? (
                  <motion.div
                    key="projection"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProjectionChart data={results.tablaAnual} retirementAge={inputs.edadJubilacion} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-950/80 text-slate-500 uppercase text-[10px] tracking-[0.15em]">
                          <tr>
                            <th className="px-6 py-5 font-black border-b border-slate-800">Año</th>
                            <th className="px-6 py-5 font-black border-b border-slate-800">Edad</th>
                            <th className="px-6 py-5 font-black border-b border-slate-800 text-right">Caja</th>
                            <th className="px-6 py-5 font-black border-b border-slate-800 text-right">Reserva</th>
                            <th className="px-6 py-5 font-black border-b border-slate-800 text-right">Rendimiento</th>
                            <th className="px-6 py-5 font-black border-b border-slate-800 text-right">Gasto Mes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {results.tablaAnual.map((row) => (
                            <tr key={`${row.ano}-${row.edad}`} className="hover:bg-blue-500/5 transition-colors group">
                              <td className="px-6 py-4 text-slate-400 font-mono group-hover:text-blue-400">{row.ano}</td>
                              <td className="px-6 py-4 text-slate-500">{row.edad} años</td>
                              <td className="px-6 py-4 text-emerald-400/90 text-right font-mono">
                                ${Math.round(row.capitalCaja).toLocaleString('de-DE')}
                              </td>
                              <td className="px-6 py-4 text-blue-400/90 text-right font-mono">
                                ${Math.round(row.capitalReserva).toLocaleString('de-DE')}
                              </td>
                              <td className="px-6 py-4 text-indigo-400 text-right font-mono">
                                +${Math.round(row.rendimientoTotal).toLocaleString('de-DE')}
                              </td>
                              <td className="px-6 py-4 text-slate-500 text-right">
                                ${Math.round(row.gastosMensuales || 0).toLocaleString('de-DE')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
              )}
            </AnimatePresence>
          </section>
            
            {/* Scenario Insights */}
            <motion.div 
              layout
              className="bg-gradient-to-br from-blue-600/10 via-slate-900/50 to-indigo-600/10 border border-blue-500/20 rounded-3xl p-8 flex flex-col md:flex-row gap-6 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
              <div className="p-4 h-fit bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
                <Settings2 size={28} />
              </div>
              <div className="space-y-3 relative z-10">
                <h4 className="font-black text-blue-100 flex items-center gap-3 italic uppercase tracking-widest text-xs">
                  Análisis Inteligente del Plan
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                </h4>
                <p className="text-base text-blue-300/70 leading-relaxed font-medium">
                  Basado en tu tasa de ahorro actual de <span className="text-blue-100 font-bold">${inputs.aporteMensualJubilacion.toLocaleString('de-DE')}/mes</span>, 
                  tu capital proyectado al retiro es de <span className="text-emerald-400 font-bold">${Math.round(results.acumulacion.capitalTotalFinal).toLocaleString('de-DE')}</span>. 
                  {results.retiro.esSuficiente 
                    ? ` Este patrimonio es suficiente para cubrir tu nivel de vida deseado hasta los ${inputs.esperanzaVida} años.` 
                    : ` Actualmente el plan presenta un déficit. Considera extender la jubilación a los ${inputs.edadJubilacion + 3} años o aumentar el ahorro mensual.`}
                </p>
              </div>
            </motion.div>
            
            {/* Footer inside content area for consistency */}
            <footer className="pt-12 pb-6 border-t border-slate-900">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600">
                <p className="text-[10px] uppercase tracking-widest font-bold">
                  © 2026 Jubilación Pro v2.0 • Simulación Estocástica de Activos
                </p>
                <div className="flex gap-6">
                  <span className="text-[9px] uppercase tracking-widest hover:text-blue-400 cursor-help transition-colors">Seguridad AES-256</span>
                  <span className="text-[9px] uppercase tracking-widest hover:text-blue-400 cursor-help transition-colors">Cálculo en Local</span>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmText={modalConfig.confirmText}
        variant={modalConfig.variant}
      />
    </div>
  );
}
