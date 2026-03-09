"use client";

import { useCalculator } from "@/hooks/use-calculator";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ProjectionChart } from "@/components/dashboard/ProjectionChart";
import { CalculatorInputs, FullSimulationResult } from "@/lib/types";
import { RetirementCalculator } from "@/lib/calculator";
import { InputsPanel } from "@/components/dashboard/InputsPanel";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Settings2, LineChart, LayoutDashboard, Share2, Download, Upload, RotateCcw, X, ChevronLeft, ChevronRight, Info, Menu, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import confetti from "canvas-confetti";
import { DEFAULT_INPUTS } from "@/lib/constants";
import * as XLSX from "xlsx-js-style";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";

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
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const [hoveredInput, setHoveredInput] = useState<keyof CalculatorInputs | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Generate preview scenarios based on the hovered input in the sidebar
  const previewScenarios = useMemo(() => {
    if (!hoveredInput || hoveredInput === 'esperanzaVida' || isAdjusting) return undefined;
    
    // Si estamos en el slider de margen de seguridad y el ojo está tachado, no mostrar nada
    if (hoveredInput === 'margenSeguridad' && !inputs.verMargenSeguridad) return undefined;

    const variations = [-2, -1, 1, 2];
    const key = hoveredInput as string;
    
    return variations.map(v => {
      const p = { ...inputs };
      const currentVal = p[hoveredInput] as number;
      let variedValue: number;
      
      if (key === 'aporteMensualJubilacion') {
        // Special case for savings: use fixed $100 steps for clearer sensitivity
        variedValue = Math.max(0, currentVal + (v * 50));
        (p as any)[hoveredInput] = variedValue;
      } else if (key.includes('tasa') || key.includes('inflacion')) {
        variedValue = Math.max(0, currentVal + (v * 0.5));
        (p as any)[hoveredInput] = variedValue;
      } else if (key.includes('capital') || key.includes('ingreso') || key.includes('gasto') || key.includes('aporte')) {
        variedValue = Math.max(0, currentVal * (1 + (v * 0.1)));
        (p as any)[hoveredInput] = variedValue;
      } else {
        variedValue = Math.max(0, currentVal + v);
        (p as any)[hoveredInput] = variedValue;
      }

      // Format label based on key
      let label = "";
      if (key.includes('tasa') || key.includes('inflacion') || key === 'margenSeguridad') {
        label = `${variedValue.toFixed(1)}%`;
      } else if (key.includes('edad') || key === 'esperanzaVida') {
        label = `${Math.round(variedValue)} años`;
      } else {
        label = `$${Math.round(variedValue).toLocaleString('de-DE')}`;
      }
      
      const calc = new RetirementCalculator(p);
      return {
        data: calc.runFullSimulation().tablaMensual,
        label,
        dataKey: key === 'margenSeguridad' ? 'capitalTotalStressed' : 'capitalTotal'
      };
    });
  }, [hoveredInput, inputs, isAdjusting]);

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

  const getStartMonthName = (monthIndex: number) => {
    const months = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];
    return months[monthIndex];
  };

  const handleExcelExport = () => {
    try {
      const dataToExport: any[] = [];
      const rowProps: any[] = [];

      // Row 1: Header (Always visible)
      rowProps.push({ level: 0 });

      results.tablaMensual.forEach((row, index) => {
        const isStart = index === 0;
        const d = new Date(inputs.anoInicio, inputs.mesInicio + index, 1);
        
        dataToExport.push({
          "Fecha": d,
          "Periodo": isStart ? `Inicio (${getStartMonthName(inputs.mesInicio)})` : `${getStartMonthName(row.mes || 0)} ${row.ano}`,
          "Año": row.ano,
          "Mes": getStartMonthName(row.mes || 0),
          "Edad": row.edad,
          "Capital Caja ($)": Math.round(row.capitalCaja),
          "Capital Reserva ($)": Math.round(row.capitalReserva),
          "Capital Total ($)": Math.round(row.capitalTotal),
          "Rend. Caja ($)": Math.round(row.rendimientoCaja || 0),
          "Rend. Reserva ($)": Math.round(row.rendimientoReserva || 0),
          "Rend. Total ($)": Math.round(row.rendimientoTotal),
          "Ingresos Trabajo ($)": Math.round(row.ingresosTrabajo || 0),
          "Gasto Mes ($)": Math.round(row.gastosMensuales || 0),
          "Gasto Anual Acum ($)": Math.round(row.gastosAnuales || 0),
          "Aportes Reserva ($)": Math.round(row.aportes || 0),
          "Inflación Acum (Ref)": parseFloat(row.referenciaInflacion.toFixed(4))
        });

        // Group Jan-Nov rows (level 1), keeping the annual closure (Dec) and Start visible (level 0)
        rowProps.push({
          level: (row.mes === 11 || isStart) ? 0 : 1
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport, { cellDates: true });
      const workbook = XLSX.utils.book_new();
      
      // Set row properties for grouping
      worksheet['!rows'] = rowProps;

      // Apply styles to headers
      const range = XLSX.utils.decode_range(worksheet['!ref']!);
      const headerColor = "3070A9";
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!worksheet[address]) continue;
        worksheet[address].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: headerColor } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }

      // Format cells
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        // Format Fecha column (C=0)
        const dateAddr = XLSX.utils.encode_cell({ r: R, c: 0 });
        if (worksheet[dateAddr]) {
          worksheet[dateAddr].z = "dd/mm/YYYY";
        }

        // Format Inflación column (C=15) - Use standard number format
        // Excel will show dot or comma based on user local settings if sent as number
        const inflAddr = XLSX.utils.encode_cell({ r: R, c: 15 });
        if (worksheet[inflAddr]) {
          worksheet[inflAddr].z = "0.00"; // Internal Excel format always uses dot, but displays based on OS
        }
      }

      // Freeze first row and first column
      worksheet["!views"] = [{ state: "frozen", ySplit: 1, xSplit: 1 }];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Plan Detallado");
      
      worksheet["!cols"] = [ 
        { wch: 12 }, { wch: 20 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, 
        { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, 
        { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 18 }
      ];

      XLSX.writeFile(workbook, `jubilacion_pro_detalle_mensual.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Error al generar el Excel detallado.");
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
    <div className="h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="h-14 lg:h-16 flex-shrink-0 z-50 border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-md">
        <div className="px-3 lg:px-4 h-full flex justify-between items-center">
          <div className="flex items-center gap-2 lg:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden lg:block"
              aria-label={isSidebarOpen ? "Cerrar parámetros" : "Abrir parámetros"}
            >
              <Settings2 size={20} />
            </button>
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-2xl" aria-hidden="true">
                <img src="/icon.png" alt="Logo Jubilación Pro" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:flex items-center">
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  Jubilación Pro
                </span>
                <span className="hidden md:inline-block ml-4 pl-4 border-l border-slate-800 text-[10px] text-slate-500 font-medium max-w-[180px] leading-tight uppercase tracking-wider">
                  Simulador avanzado de independencia financiera y retiro
                </span>
              </div>
            </div>
          </div>

          {/* Desktop nav buttons */}
          <div className="hidden sm:flex items-center gap-2">
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

            <NavButtonTooltip content="Exportar Excel">
              <button 
                onClick={handleExcelExport}
                className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                aria-label="Exportar cálculos a Excel"
              >
                <FileSpreadsheet size={18} />
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

          {/* Mobile nav buttons — compact */}
          <div className="flex sm:hidden items-center gap-1">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImport} 
              accept=".json" 
              className="hidden" 
            />
            <button 
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg transition-all border border-blue-500 shadow-lg shadow-blue-900/20 active:scale-95"
            >
              <Upload size={14} />
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Menú"
              >
                <Menu size={20} />
              </button>
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-[60]"
                  >
                    <button onClick={() => { handleReset(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
                      <RotateCcw size={16} className="text-rose-400" />
                      Resetear Plan
                    </button>
                    <button onClick={() => { fileInputRef.current?.click(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 transition-colors border-t border-slate-800">
                      <Download size={16} className="text-slate-400" />
                      Importar JSON
                    </button>
                    <button onClick={() => { handleExcelExport(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 transition-colors border-t border-slate-800">
                      <FileSpreadsheet size={16} className="text-emerald-400" />
                      Exportar Excel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Close mobile menu when clicking outside */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[55] sm:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Parameters (Desktop only) */}
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
              <InputsPanel 
                inputs={inputs} 
                updateInput={updateInput} 
                onHover={setHoveredInput}
                onAdjustingChange={setIsAdjusting}
              />
            </div>
          </div>
        </motion.aside>

        {/* Floating Toggle Button - Desktop (visible when sidebar is closed) */}
        {!isSidebarOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 bottom-4 z-40 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl shadow-blue-500/40 transition-transform hover:scale-110 hidden lg:flex items-center gap-2"
          >
            <Settings2 size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">Ajustar Plan</span>
            <ChevronRight size={16} />
          </motion.button>
        )}

        {/* Mobile FAB - Open Parameters Drawer */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          onClick={() => setIsMobileDrawerOpen(true)}
          className="fixed right-4 bottom-5 z-40 p-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-2xl shadow-blue-600/40 active:scale-90 transition-transform lg:hidden flex items-center gap-2"
          aria-label="Abrir parámetros"
        >
          <Settings2 size={22} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Ajustar</span>
        </motion.button>

        {/* Mobile Bottom Sheet Drawer */}
        <AnimatePresence>
          {isMobileDrawerOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
                onClick={() => setIsMobileDrawerOpen(false)}
              />
              {/* Drawer */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="fixed inset-x-0 bottom-0 z-[80] lg:hidden bg-[#0a0f1e] border-t border-slate-700/50 rounded-t-3xl shadow-2xl shadow-black/60"
                style={{ maxHeight: '88vh' }}
              >
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-slate-600" />
                </div>
                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                      <Settings2 size={16} className="text-blue-400" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-300">Parámetros</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800/60 rounded-xl transition-colors active:scale-90"
                    aria-label="Cerrar parámetros"
                  >
                    <X size={18} />
                  </button>
                </div>
                {/* Content */}
                <div className="overflow-y-auto px-4 pb-8" style={{ maxHeight: 'calc(88vh - 80px)' }}>
                  <InputsPanel 
                    inputs={inputs} 
                    updateInput={updateInput} 
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Dashboard Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/40">
          <div className="max-w-6xl mx-auto px-3 py-4 sm:p-4 md:p-8 space-y-5 sm:space-y-8 pb-24 lg:pb-8">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500 flex items-center gap-2 sm:gap-3">
                  <LayoutDashboard size={22} className="text-blue-500 sm:w-7 sm:h-7" />
                  Estado de tu Retiro
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">Análisis detallado basado en tus parámetros actuales.</p>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 bg-slate-800/50 px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-widest border border-slate-700/50">
                  Valores ajustados <span className="text-slate-400">por inflación</span>
                </span>
                <span className={`text-[9px] sm:text-[10px] font-black px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-widest border ${
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
            <section className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between px-1 sm:px-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <LineChart size={16} className="text-blue-500 sm:w-[18px] sm:h-[18px]" />
                  <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500">
                    Proyección
                    <span className="hidden sm:inline"> de Patrimonio</span>
                  </h2>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {activeTab === "details" && (
                    <motion.button 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      onClick={handleExcelExport}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-[9px] sm:text-[10px] font-bold text-emerald-400 rounded-lg transition-all border border-emerald-500/20 uppercase tracking-wider"
                    >
                      <FileSpreadsheet size={12} />
                      <span>Excel</span>
                    </motion.button>
                  )}

                  <div className="flex bg-slate-900/50 p-0.5 sm:p-1 rounded-xl border border-slate-800/50 backdrop-blur-sm">
                    <button 
                      onClick={() => setActiveTab("projection")}
                      className={`px-2.5 sm:px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        activeTab === "projection" 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Gráfico
                    </button>
                    <button 
                      onClick={() => setActiveTab("details")}
                      className={`px-2.5 sm:px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        activeTab === "details" 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Tabla
                    </button>
                  </div>
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
                    <ProjectionChart 
                      data={results.tablaMensual} 
                      retirementAge={inputs.edadJubilacion} 
                      previewScenarios={previewScenarios}
                      showStressedLine={inputs.verMargenSeguridad}
                    />
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
                        <thead className="bg-slate-950/80 text-slate-500 uppercase text-[9px] tracking-[0.1em]">
                          <tr>
                            <th className="px-4 py-5 font-black border-b border-slate-800 whitespace-nowrap">Año</th>
                            <th className="px-4 py-5 font-black border-b border-slate-800 whitespace-nowrap">Edad</th>
                            <th className="px-4 py-5 font-black border-b border-slate-800 text-right whitespace-nowrap">Cap. Caja</th>
                            <th className="px-4 py-5 font-black border-b border-slate-800 text-right whitespace-nowrap">Cap. Reserva</th>
                            <th className="px-4 py-5 font-black border-b border-slate-800 text-right whitespace-nowrap">Rend. Caja</th>
                            <th className="px-4 py-5 font-black border-b border-slate-800 text-right whitespace-nowrap">Rend. Res.</th>
                            <th className="px-4 py-5 font-black border-b border-slate-800 text-right whitespace-nowrap">Ingresos</th>
                            <th className="px-4 py-5 font-black border-b border-slate-800 text-right whitespace-nowrap">Gasto Año</th>
                            <th className="px-4 py-5 font-black border-b border-slate-800 text-right whitespace-nowrap">Aportes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {results.tablaAnual.map((row, index) => (
                            <tr key={`${row.ano}-${row.edad}-${index}`} className="hover:bg-blue-500/5 transition-colors group">
                              <td className="px-4 py-4 text-slate-400 font-mono group-hover:text-blue-400 whitespace-nowrap text-[11px]">
                                {index === 0 ? (
                                  <>
                                    <span className="text-[9px] text-blue-500/70 mr-1 uppercase tracking-tighter font-bold">{getStartMonthName(inputs.mesInicio)}</span>
                                    <span className="text-blue-400 font-bold">{row.ano}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-[9px] text-slate-500 mr-1 uppercase tracking-tighter">Dic</span>
                                    {row.ano}
                                  </>
                                )}
                              </td>
                              <td className="px-4 py-4 text-slate-500 text-[11px] whitespace-nowrap">{row.edad} años</td>
                              <td className="px-4 py-4 text-emerald-400/90 text-right font-mono text-[11px]">
                                ${Math.round(row.capitalCaja).toLocaleString('de-DE')}
                              </td>
                              <td className="px-4 py-4 text-blue-400/90 text-right font-mono text-[11px]">
                                ${Math.round(row.capitalReserva).toLocaleString('de-DE')}
                              </td>
                              <td className="px-4 py-4 text-emerald-500/60 text-right font-mono text-[11px]">
                                +${Math.round(row.rendimientoCaja || 0).toLocaleString('de-DE')}
                              </td>
                              <td className="px-4 py-4 text-blue-500/60 text-right font-mono text-[11px]">
                                +${Math.round(row.rendimientoReserva || 0).toLocaleString('de-DE')}
                              </td>
                              <td className="px-4 py-4 text-slate-400 text-right font-mono text-[11px]">
                                ${Math.round(row.ingresosTrabajo || 0).toLocaleString('de-DE')}
                              </td>
                              <td className="px-4 py-4 text-rose-400/70 text-right font-mono text-[11px]">
                                ${Math.round(row.gastosAnuales || 0).toLocaleString('de-DE')}
                              </td>
                              <td className="px-4 py-4 text-indigo-400/80 text-right font-mono text-[11px]">
                                ${Math.round(row.aportes || 0).toLocaleString('de-DE')}
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
              className="bg-gradient-to-br from-blue-600/10 via-slate-900/50 to-indigo-600/10 border border-blue-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col md:flex-row gap-4 sm:gap-6 shadow-2xl relative overflow-hidden group"
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
            
            {/* SEO & Information Section */}
            <section className="mt-10 sm:mt-16 space-y-8 sm:space-y-12 border-t border-slate-900 pt-10 sm:pt-16">
              <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Info size={20} className="text-blue-500" />
                    ¿Cómo funciona este simulador?
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Jubilación Pro utiliza algoritmos de proyección financiera para calcular la evolución de tu patrimonio a largo plazo. 
                    A diferencia de calculadoras simples, nuestro sistema considera el <strong>interés compuesto</strong>, la 
                    <strong> inflación proyectada</strong> y la distinción entre capital de caja (disponible) y reserva (inversión).
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    El simulador ajusta automáticamente todos los valores futuros a "dólares de hoy" para que puedas entender tu 
                    poder adquisitivo real al momento del retiro.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <LineChart size={20} className="text-emerald-500" />
                    Análisis de Libertad Financiera
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span><strong>Tasa de Retiro:</strong> Calculamos si tu patrimonio es capaz de sostener tus gastos mensuales sin agotarse.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span><strong>Margen de Seguridad:</strong> Evalúa tu plan bajo escenarios de estrés de mercado para asegurar tu futuro.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span><strong>Optimización Fiscal:</strong> Separa tus ahorros en diferentes tipos de activos para una mejor visualización.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8">
                <h3 className="text-lg font-bold text-white mb-6">Preguntas Frecuentes sobre el Retiro</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <h4 className="text-blue-400 text-sm font-bold">¿Qué es el interés compuesto?</h4>
                    <p className="text-slate-500 text-[13px] leading-relaxed">Es el efecto de reinvertir los beneficios generados por tu capital, haciendo que tu dinero crezca de forma exponencial con el tiempo.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-blue-400 text-sm font-bold">¿Por qué usar inflación?</h4>
                    <p className="text-slate-500 text-[13px] leading-relaxed">La inflación reduce el poder de compra. Nuestro simulador descuenta la inflación para mostrarte cuánto valdrá tu dinero realmente en el futuro.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-blue-400 text-sm font-bold">¿Qué es el margen de seguridad?</h4>
                    <p className="text-slate-500 text-[13px] leading-relaxed">Es un parámetro que estresa el plan reduciendo la rentabilidad y aumentando la inflación para verificar si tu estrategia aguanta escenarios difíciles.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer inside content area for consistency */}
            <footer className="pt-12 pb-6 border-t border-slate-900">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600">
                <p className="text-[10px] uppercase tracking-widest font-bold">
                  © 2026 Jubilación Pro • Simulación Estocástica de Activos
                </p>
                <div className="flex gap-6">
                  <Link href="/terminos-y-condiciones" className="text-[9px] uppercase tracking-widest hover:text-blue-400 transition-colors">Términos y Condiciones</Link>
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
