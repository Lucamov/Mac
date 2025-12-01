import React, { useState } from 'react';
import { CATEGORY_STYLES } from '../types';

// --- Interface Types ---
interface DailyData {
  day: number;
  amount: number;
  isMax: boolean;
}

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

// --- Daily Trend Chart (Bar Chart) ---
export const DailySporadicChart: React.FC<{ data: DailyData[] }> = ({ data }) => {
  const maxAmount = Math.max(...data.map(d => d.amount));
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // If no data or maxAmount is 0
  if (maxAmount === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
        <p>Sem gastos esporádicos neste mês.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Chart Area */}
      <div className="relative h-64 flex items-end gap-1 sm:gap-2 pt-8 pb-2">
        {data.map((item) => {
          const heightPercentage = (item.amount / maxAmount) * 100;
          const isHovered = hoveredDay === item.day;
          
          return (
            <div 
              key={item.day} 
              className="flex-1 flex flex-col items-center group relative h-full justify-end"
              onMouseEnter={() => setHoveredDay(item.day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {/* Tooltip / Label for Value */}
              <div 
                className={`absolute -top-10 left-1/2 -translate-x-1/2 z-20 bg-slate-800 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap transition-all duration-200 pointer-events-none border border-slate-700 ${
                  isHovered || item.isMax ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                <span className="font-bold text-orange-400">Dia {item.day}</span>
                <span className="mx-1">|</span>
                R$ {item.amount.toFixed(0)}
              </div>

              {/* The Bar */}
              <div 
                style={{ height: `${heightPercentage}%` }}
                className={`w-full max-w-[12px] sm:max-w-[20px] rounded-t-sm transition-all duration-500 ease-out relative ${
                  item.isMax 
                    ? 'bg-gradient-to-t from-orange-600 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                    : item.amount > 0 ? 'bg-orange-900/40 hover:bg-orange-500/80' : 'bg-slate-800/30'
                }`}
              >
                {/* Highlight Marker for Max Day */}
                {item.isMax && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                )}
              </div>
            </div>
          );
        })}
        
        {/* Horizontal Grid Lines (Visual Guide) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 flex flex-col justify-between opacity-10">
           <div className="w-full h-px bg-slate-200 border-t border-dashed"></div>
           <div className="w-full h-px bg-slate-200 border-t border-dashed"></div>
           <div className="w-full h-px bg-slate-200 border-t border-dashed"></div>
           <div className="w-full h-px bg-slate-200 border-t border-dashed"></div>
        </div>
      </div>

      {/* X Axis Labels (Simplified) */}
      <div className="flex justify-between text-[10px] text-slate-500 mt-2 px-1">
        <span>Início do Mês</span>
        <span>Meio</span>
        <span>Fim</span>
      </div>
    </div>
  );
};

// --- Category Donut Chart ---
export const CategoryDonutChart: React.FC<{ data: CategoryData[] }> = ({ data }) => {
  if (data.length === 0) {
    return <div className="text-center text-slate-500 py-10">Sem dados.</div>;
  }

  // Calculate conic gradient segments
  let currentAngle = 0;
  const gradientSegments = data.map(item => {
    // Map tailwind classes to approximate hex codes for the gradient
    const colorMap: Record<string, string> = {
      'text-orange-400': '#fb923c',
      'text-blue-400': '#60a5fa',
      'text-indigo-400': '#818cf8',
      'text-rose-400': '#fb7185',
      'text-purple-400': '#c084fc',
      'text-yellow-400': '#facc15',
      'text-emerald-400': '#34d399',
      'text-cyan-400': '#22d3ee',
      'text-amber-400': '#fbbf24',
      'text-slate-400': '#94a3b8',
    };
    
    const categoryStyle = CATEGORY_STYLES[item.name] || CATEGORY_STYLES['Outros'];
    const hexColor = colorMap[categoryStyle.color] || '#94a3b8';

    const start = currentAngle;
    const end = currentAngle + (item.percentage * 3.6); // 100% = 360deg
    currentAngle = end;
    
    return `${hexColor} ${start}deg ${end}deg`;
  }).join(', ');

  const chartStyle = {
    background: `conic-gradient(${gradientSegments})`,
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* The Donut */}
      <div className="relative w-48 h-48 rounded-full shadow-2xl shrink-0 ring-4 ring-slate-900/50" style={chartStyle}>
        {/* Inner Circle (Hole) */}
        <div className="absolute inset-0 m-auto w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center flex-col z-10 shadow-inner">
           <span className="text-xs text-slate-400 uppercase tracking-widest">Total</span>
           <span className="text-lg font-bold text-white">100%</span>
        </div>
      </div>

      {/* Legend - Fixed to Single Column to prevent overlapping */}
      <div className="w-full flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {data.map(item => {
           const categoryStyle = CATEGORY_STYLES[item.name] || CATEGORY_STYLES['Outros'];
           return (
             <div key={item.name} className="flex items-center justify-between text-sm group p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full shadow-sm ${categoryStyle.color.replace('text-', 'bg-')}`}></div>
                   <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-mono text-slate-400 group-hover:text-white transition-colors">
                  {item.percentage.toFixed(1)}%
                </span>
             </div>
           );
        })}
      </div>
    </div>
  );
};