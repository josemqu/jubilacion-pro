import React, { useMemo } from "react";
import { YearData } from "@/lib/types";
import { 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceArea,
  Line,
  ComposedChart
} from "recharts";

interface ProjectionChartProps {
  data: YearData[];
  retirementAge: number;
}

const CustomTooltip = React.memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as YearData;
    return (
      <div className="bg-slate-900/95 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md min-w-[200px]">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
          <span className="text-slate-200 font-bold text-lg">Año {Math.floor(label)}</span>
          <span className="text-slate-400 text-sm">{data.edad} años</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-slate-400">Reserva</span>
            </div>
            <span className="text-blue-400 font-mono font-bold">${Math.round(data.capitalReserva).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-400">Caja</span>
            </div>
            <span className="text-emerald-400 font-mono font-bold">${Math.round(data.capitalCaja).toLocaleString()}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center bg-slate-800/30 -mx-4 px-4 py-2">
            <span className="text-slate-200 text-xs font-bold uppercase tracking-tight">Total</span>
            <span className="text-white font-mono text-sm font-black">${Math.round(data.capitalTotal).toLocaleString()}</span>
          </div>
          {data.gastosAnuales > 0 && (
            <div className="text-[10px] text-slate-500 italic mt-1 text-right">
              Gasto anual: ${Math.round(data.gastosAnuales).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = "CustomTooltip";

export const ProjectionChart = React.memo(({ data, retirementAge }: ProjectionChartProps) => {
  const formatCurrency = (value: number) => 
    `$${(value / 1000).toFixed(0)}k`;

  const { retirementYear, lastYear } = useMemo(() => ({
    retirementYear: data.find(d => d.edad >= retirementAge)?.ano,
    lastYear: data[data.length - 1]?.ano
  }), [data, retirementAge]);

  return (
    <div className="h-[450px] w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
          Evolución de Patrimonio Proyectada
        </h3>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold">
          <div className="flex items-center gap-1.5 text-slate-500">
            <div className="w-3 h-1 bg-slate-800 border border-slate-700/50" />
            Acumulación
          </div>
          <div className="flex items-center gap-1.5 text-rose-500/70">
            <div className="w-3 h-1 bg-rose-500/10 border border-rose-500/20" />
            Jubilación
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReserva" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCaja" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
          
          <XAxis 
            dataKey="ano" 
            stroke="#475569" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#64748b' }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#475569" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={formatCurrency}
            tick={{ fill: '#64748b' }}
          />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#334155', strokeWidth: 1 }}
            isAnimationActive={false}
          />
          
          <Legend 
            verticalAlign="top" 
            align="right" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ paddingTop: '0', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          />
          
          {/* Visual distinction between phases */}
          {retirementYear && (
            <ReferenceArea 
              x1={retirementYear} 
              x2={lastYear} 
              fill="rgba(244, 63, 94, 0.08)" 
              stroke="none"
            />
          )}

          {/* Background Areas (Stacked) */}
          <Area
            type="monotone"
            dataKey="capitalReserva"
            stackId="1"
            stroke="none"
            fill="url(#colorReserva)"
            legendType="none"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="capitalCaja"
            stackId="1"
            stroke="none"
            fill="url(#colorCaja)"
            legendType="none"
            isAnimationActive={false}
          />

          {/* Individual Curves */}
          <Line
            type="monotone"
            dataKey="capitalReserva"
            name="Reserva"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="capitalCaja"
            name="Caja"
            stroke="#10b981"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
            isAnimationActive={false}
          />
          
          {/* Total Line */}
          <Line
            type="monotone"
            dataKey="capitalTotal"
            name="Total"
            stroke="#f8fafc"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            activeDot={{ r: 4, fill: '#f8fafc', stroke: '#0f172a', strokeWidth: 2 }}
            isAnimationActive={false}
          />

          {/* Vertical Divider - Start of Retirement */}
          {retirementYear && (
            <ReferenceLine 
              x={retirementYear} 
              stroke="#f43f5e" 
              strokeWidth={3}
              label={{ 
                value: '➔ JUBILACIÓN', 
                position: 'insideTopRight', 
                fill: '#f43f5e', 
                fontSize: 12, 
                fontWeight: '900',
                dy: 10,
                dx: -10
              }} 
            />
          )}

          {/* Baseline */}
          <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});

ProjectionChart.displayName = "ProjectionChart";

