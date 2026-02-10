"use client";

import { YearData } from "@/lib/types";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Line,
  ComposedChart
} from "recharts";

interface ProjectionChartProps {
  data: YearData[];
  retirementAge: number;
}

export function ProjectionChart({ data, retirementAge }: ProjectionChartProps) {
  const formatCurrency = (value: number) => 
    `$${(value / 1000).toFixed(0)}k`;

  return (
    <div className="h-[450px] w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
      <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
        Evolución de Patrimonio Proyectada
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReserva" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCaja" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
          <XAxis 
            dataKey="ano" 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#64748b' }}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={formatCurrency}
            tick={{ fill: '#64748b' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.95)", border: "1px solid #334155", borderRadius: "16px", backdropFilter: "blur(8px)", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)" }}
            itemStyle={{ fontSize: "12px", padding: "4px 0" }}
            labelStyle={{ color: "#94a3b8", fontWeight: "bold", marginBottom: "8px" }}
            formatter={(val: number | any) => [`$${(val ?? 0).toLocaleString()}`, ""]}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ paddingTop: '0', fontSize: '12px', color: '#94a3b8' }}
          />
          <Area
            type="monotone"
            dataKey="capitalReserva"
            name="Reserva"
            stroke="#3b82f6"
            strokeWidth={0}
            fillOpacity={1}
            fill="url(#colorReserva)"
            stackId="1"
          />
          <Area
            type="monotone"
            dataKey="capitalCaja"
            name="Caja"
            stroke="#10b981"
            strokeWidth={0}
            fillOpacity={1}
            fill="url(#colorCaja)"
            stackId="1"
          />
          <Line
            type="monotone"
            dataKey="capitalTotal"
            name="Patrimonio Total"
            stroke="#f8fafc"
            strokeWidth={3}
            dot={false}
            strokeDasharray="5 5"
            activeDot={{ r: 6, fill: '#f8fafc', stroke: '#0f172a', strokeWidth: 2 }}
          />
          <ReferenceLine 
            x={data.find(d => d.edad >= retirementAge)?.ano} 
            stroke="#ef4444" 
            strokeDasharray="4 4" 
            strokeWidth={2}
            label={{ value: 'JUBILACIÓN', position: 'insideTopLeft', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
