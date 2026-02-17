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
    dataKey?: string;
  }[];
  showStressedLine?: boolean;
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

export const ProjectionChart = React.memo(({ data, retirementAge, previewScenarios, showStressedLine = true }: ProjectionChartProps) => {
  const formatCurrency = (value: number) => 
    `$${(value / 1000).toFixed(0)}k`;

  const { chartData, retirementIndex, lastIndex, retirementDataPoint, allJanuaryTicks, januaryTicks, maxY } = useMemo(() => {
    const enrichedData = data.map((d, i) => ({ ...d, index: i }));
    const rIdx = data.findIndex(d => d.edad >= retirementAge);
    // Calculate ticks (January of each year) 
    const allJanuaryTicks = enrichedData
      .filter(d => d.mes === 0)
      .map(d => d.index);
    
    // Pick a step (every N years) for major labels to avoid collision
    const totalYears = allJanuaryTicks.length;
    const step = Math.ceil(totalYears / 10); 
    const filteredTicks = allJanuaryTicks.filter((_, i) => i % step === 0);
    
    // Find max value in main data for fixed Y scale
    const maxVal = Math.max(...data.map(d => Math.max(d.capitalTotal, d.capitalTotalStressed || 0)));
    
    return {
      chartData: enrichedData,
      retirementIndex: rIdx !== -1 ? rIdx : null,
      lastIndex: data.length - 1,
      retirementDataPoint: rIdx !== -1 ? data[rIdx] : null,
      allJanuaryTicks,
      januaryTicks: filteredTicks,
      maxY: maxVal > 0 ? maxVal * 1.5 : 1000 
    };
  }, [data, retirementAge]);

  return (
    <div className="h-[540px] w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
          Evolución de Patrimonio y Escenarios de Sensibilidad
        </h3>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="115%" style={{ transform: 'translateY(-50px)' }}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 10 }}>
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
          
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.9} />
          
          <XAxis 
            dataKey="index" 
            type="number"
            domain={[0, chartData.length - 1]}
            allowDataOverflow={true}
            stroke="#475569" 
            fontSize={11} 
            tickLine={false}
            axisLine={{ stroke: '#1e293b' }}
            ticks={allJanuaryTicks}
            interval={0}
            padding={{ left: 0, right: 0 }}
            tick={(props: any) => {
              const { x, y, payload } = props;
              const isMajor = januaryTicks.includes(payload.value);
              const dataPoint = chartData[payload.value];
              if (!dataPoint) return null;

              return (
                <g>
                  {/* Ticks starting slightly above the baseline to ensure they touch the axis line */}
                  <line 
                    x1={x} 
                    y1={y-8} 
                    x2={x} 
                    y2={y + (isMajor ? 0 : -2)} 
                    stroke="#334155" 
                    strokeWidth={1} 
                  />
                  {isMajor && (
                    <text 
                      x={x} 
                      y={y + 12} 
                      fill="#64748b" 
                      fontSize={10} 
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {dataPoint.ano}
                    </text>
                  )}
                </g>
              );
            }}
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
              top: 8, 
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
            {showStressedLine && (
              <Line
                type="monotone"
                dataKey="capitalTotalStressed"
                name="Mínimo (Stressed)"
                stroke="#fbbf24"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 3, fill: '#fbbf24', stroke: '#0f172a', strokeWidth: 1 }}
                isAnimationActive={false}
              />
            )}

            {/* Ghost Lines for Preview Scenarios */}
            {previewScenarios?.map((scenario, idx) => {
              const isStressed = scenario.dataKey === 'capitalTotalStressed';
              const strokeColor = isStressed ? "#fbbf24" : "#ffffffff";
              const currentDataKey = scenario.dataKey || "capitalTotal";

              return (
                <Line
                  key={`preview-${idx}`}
                  data={scenario.data.map((d, i) => ({ ...d, index: i }))}
                  type="monotone"
                  dataKey={currentDataKey}
                  stroke={strokeColor}
                  strokeWidth={1.5}
                  strokeOpacity={isStressed ? 0.4 : 0.2}
                  strokeDasharray="4 2"
                  dot={false}
                  isAnimationActive={false}
                  legendType="none"
                >
                  <LabelList
                    dataKey={currentDataKey}
                    position="top"
                    content={(props: any) => {
                      const { x, y, index } = props;
                      // Use scenario.data from outer scope to avoid props.data being undefined
                      if (index === Math.floor(scenario.data.length * 0.75)) {
                        return (
                          <text
                            x={x}
                            y={y - 12}
                            fill={strokeColor}
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
              );
            })}
  
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
    </div>
  );
});

ProjectionChart.displayName = "ProjectionChart";

