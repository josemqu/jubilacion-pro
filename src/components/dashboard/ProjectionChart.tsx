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
  ComposedChart,
  ReferenceDot,
  LabelList
} from "recharts";

interface ProjectionChartProps {
  data: YearData[];
  retirementAge: number;
  previewScenarios?: {
    data: YearData[];
    label: string;
  }[];
}

const CustomTooltip = React.memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as YearData;
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const monthName = data.mes !== undefined ? monthNames[data.mes] : "";

    return (
      <div className="bg-slate-900/95 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md min-w-[200px]">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
          <span className="text-slate-200 font-bold text-lg">{monthName} {data.ano}</span>
          <span className="text-slate-400 text-sm">{data.edad} años</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-slate-400">Reserva</span>
            </div>
            <span className="text-blue-400 font-mono font-bold">${Math.round(data.capitalReserva).toLocaleString('de-DE')}</span>
          </div>
          <div className="flex justify-between items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-400">Caja</span>
            </div>
            <span className="text-emerald-400 font-mono font-bold">${Math.round(data.capitalCaja).toLocaleString('de-DE')}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 space-y-2 bg-slate-800/30 -mx-4 px-4 py-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-200 text-[10px] font-bold uppercase tracking-tight">Total Esperado</span>
              <span className="text-white font-mono text-sm font-black">${Math.round(data.capitalTotal).toLocaleString('de-DE')}</span>
            </div>
            {data.capitalTotalStressed !== undefined && (
              <div className="flex justify-between items-center opacity-80">
                <span className="text-amber-400/80 text-[10px] font-bold uppercase tracking-tight">Escenario Conservador</span>
                <span className="text-amber-400 font-mono text-xs font-bold">${Math.round(data.capitalTotalStressed).toLocaleString('de-DE')}</span>
              </div>
            )}
          </div>
          {data.gastosAnuales > 0 && (
            <div className="text-[10px] text-slate-500 italic mt-1 text-right">
              Gasto anual: ${Math.round(data.gastosAnuales).toLocaleString('de-DE')}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = "CustomTooltip";

export const ProjectionChart = React.memo(({ data, retirementAge, previewScenarios }: ProjectionChartProps) => {
  const formatCurrency = (value: number) => 
    `$${(value / 1000).toFixed(0)}k`;

  const { chartData, retirementIndex, lastIndex, retirementDataPoint, decemberTicks, maxY } = useMemo(() => {
    const enrichedData = data.map((d, i) => ({ ...d, index: i }));
    const rIdx = data.findIndex(d => d.edad >= retirementAge);
    // Calculate ticks (December of each year) and filter to avoid collision
    const allDecemberTicks = enrichedData
      .filter(d => d.mes === 11)
      .map(d => d.index);
    
    // Pick a step (every N years) to keep labels legible
    const totalYears = allDecemberTicks.length;
    const step = Math.ceil(totalYears / 10); // Aim for ~10 labels
    const filteredTicks = allDecemberTicks.filter((_, i) => i % step === 0);
    
    // Find max value in main data for fixed Y scale
    const maxVal = Math.max(...data.map(d => Math.max(d.capitalTotal, d.capitalTotalStressed || 0)));
    
    return {
      chartData: enrichedData,
      retirementIndex: rIdx !== -1 ? rIdx : null,
      lastIndex: data.length - 1,
      retirementDataPoint: rIdx !== -1 ? data[rIdx] : null,
      decemberTicks: filteredTicks,
      maxY: maxVal > 0 ? maxVal * 1.1 : 1000 // 10% margin, fallback to 1000
    };
  }, [data, retirementAge]);

  return (
    <div className="h-[540px] w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
          Evolución de Patrimonio y Escenarios de Sensibilidad
        </h3>
      </div>
      
      <ResponsiveContainer width="100%" height="95%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
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
            dataKey="index" 
            type="number"
            domain={[0, chartData.length - 1]}
            allowDataOverflow={true}
            stroke="#475569" 
            fontSize={11} 
            tickLine={{ stroke: '#334155', strokeWidth: 1 }}
            axisLine={{ stroke: '#1e293b' }}
            tick={{ fill: '#64748b' }}
            ticks={decemberTicks}
            tickFormatter={(idx) => {
              const d = chartData[idx];
              return d ? d.ano.toString() : "";
            }}
            interval={0}
            padding={{ left: 0, right: 0 }}
          />
          <YAxis 
            stroke="#475569" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={formatCurrency}
            tick={{ fill: '#64748b' }}
            domain={[0, maxY]}
            allowDataOverflow={true}
          />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#334155', strokeWidth: 1 }}
            isAnimationActive={false}
          />
          
          <Legend 
            verticalAlign="top" 
            align="right" 
            height={40} 
            iconType="circle"
            wrapperStyle={{ 
              top: -45, 
              right: 0,
              fontSize: '10px', 
              color: '#94a3b8', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              fontWeight: 'bold'
            }}
          />
            
            {/* Visual distinction between phases */}
            {retirementIndex !== null && (
              <ReferenceArea 
                x1={retirementIndex} 
                x2={lastIndex} 
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
            
            {/* Stressed Total Line (Minima) */}
            <Line
              type="monotone"
              dataKey="capitalTotalStressed"
              name="Mínimo (Stressed)"
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 3, fill: '#fbbf24', stroke: '#0f172a', strokeWidth: 1 }}
              isAnimationActive={false}
            />

            {/* Ghost Lines for Preview Scenarios */}
            {previewScenarios?.map((scenario, idx) => (
              <Line
                key={`preview-${idx}`}
                data={scenario.data.map((d, i) => ({ ...d, index: i }))}
                type="monotone"
                dataKey="capitalTotal"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeOpacity={0.4}
                strokeDasharray="3 6"
                dot={false}
                isAnimationActive={false}
                legendType="none"
              >
                <LabelList
                  dataKey="capitalTotal"
                  position="top"
                  content={(props: any) => {
                    const { x, y, index } = props;
                    // Use scenario.data from outer scope to avoid props.data being undefined
                    if (index === Math.floor(scenario.data.length * 0.75)) {
                      return (
                        <text
                          x={x}
                          y={y - 10}
                          fill="#94a3b8"
                          fontSize={9}
                          fontWeight="bold"
                          textAnchor="middle"
                          className="select-none pointer-events-none opacity-80"
                        >
                          {scenario.label}
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Line>
            ))}
  
            {/* Total Line (Expected/Maxima) */}
            <Line
              type="monotone"
              dataKey="capitalTotal"
              name="Máximo (Esperado)"
              stroke="#f8fafc"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 4, fill: '#f8fafc', stroke: '#0f172a', strokeWidth: 2 }}
              isAnimationActive={false}
            />

          {/* Vertical Divider - Start of Retirement */}
          {retirementIndex !== null && (
            <ReferenceLine 
              x={retirementIndex} 
              stroke="#f43f5e" 
              strokeWidth={3}
              label={{ 
                value: '➔ JUBILACIÓN', 
                position: 'insideBottomLeft', 
                fill: '#f43f5e', 
                fontSize: 12, 
                fontWeight: '900',
                dy: -10,
                dx: 10
              }} 
            />
          )}

          {/* Data Label at Retirement Start */}
          {retirementDataPoint && retirementIndex !== null && (
            <ReferenceDot
              x={retirementIndex}
              y={retirementDataPoint.capitalTotal}
              r={5}
              fill="#f8fafc"
              stroke="#f43f5e"
              strokeWidth={2}
              label={{
                value: `$${Math.round(retirementDataPoint.capitalTotal).toLocaleString('de-DE')}`,
                position: 'top',
                fill: '#fff',
                fontSize: 14,
                fontWeight: 'bold',
                offset: 12,
                className: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
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

