"use client";

import { FullSimulationResult } from "@/lib/types";
import { motion } from "framer-motion";
import { TrendingUp, Wallet, Landmark, HandCoins, AlertTriangle, CheckCircle2, PartyPopper } from "lucide-react";

interface SummaryCardsProps {
  results: FullSimulationResult;
}

export function SummaryCards({ results }: SummaryCardsProps) {
  const { acumulacion, retiro, ingresoPerpetuoMensual, estado } = results;

  const cards = [
    {
      title: "Capital Total Final",
      value: acumulacion.capitalTotalFinal,
      icon: <TrendingUp className="text-blue-400" />,
      description: "Al momento de jubilarte",
      color: "blue"
    },
    {
      title: "Reserva Jubilación",
      value: acumulacion.capitalReservaFinal,
      icon: <Landmark className="text-indigo-400" />,
      description: "Capital exclusivo invertido",
      color: "indigo"
    },
    {
      title: "Capital de Caja",
      value: acumulacion.capitalCajaFinal,
      icon: <Wallet className="text-emerald-400" />,
      description: "Liquidez acumulada",
      color: "emerald"
    },
    {
      title: "Ingreso Perpetuo",
      value: ingresoPerpetuoMensual,
      icon: <HandCoins className="text-amber-400" />,
      description: "Retiro mensual seguro",
      color: "amber"
    }
  ];

  const statusConfig = {
    excelente: {
      icon: <PartyPopper className="w-8 h-8 text-white" />,
      text: "¡Plan Excelente!",
      sub: "Tu estrategia es sólida y segura.",
      bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
    alcanzable: {
      icon: <CheckCircle2 className="w-8 h-8 text-white" />,
      text: "Plan Alcanzable",
      sub: "Viable, pero ajustado. Vigilancia recomendada.",
      bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    },
    insuficiente: {
      icon: <AlertTriangle className="w-8 h-8 text-white" />,
      text: "Plan Insuficiente",
      sub: "Ajustes necesarios para cubrir tus metas.",
      bg: "bg-gradient-to-br from-rose-500 to-orange-600",
    }
  };

  const status = statusConfig[estado];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <motion.div 
        layout
        className={`${status.bg} p-6 rounded-2xl shadow-lg shadow-black/20 flex items-center gap-6 text-white`}
      >
        <div className="bg-white/20 p-3 rounded-full backdrop-blur-md">
          {status.icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{status.text}</h2>
          <p className="opacity-90">{status.sub}</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-sm opacity-80 uppercase tracking-widest font-semibold">Años Cubiertos</div>
          <div className="text-4xl font-black">{retiro.anosCubiertos}</div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition-colors shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-800 rounded-lg">
                {card.icon}
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-tighter">
                Preview
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-slate-400">{card.title}</h3>
              <p className="text-2xl font-bold text-slate-100">{formatCurrency(card.value)}</p>
              <p className="text-xs text-slate-500">{card.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
