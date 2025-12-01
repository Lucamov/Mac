import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { Transaction, TransactionType, CATEGORY_STYLES } from '../types';

interface CalendarViewProps {
  transactions: Transaction[];
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const CalendarView: React.FC<CalendarViewProps> = ({ transactions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // --- Calendar Logic ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // --- Data Processing ---
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }, [transactions, month, year]);

  // Map day number -> { income: number, expense: number, transactions: [] }
  const dayData = useMemo(() => {
    const map: Record<number, { income: number; expense: number; list: Transaction[] }> = {};
    
    // Initialize
    for (let i = 1; i <= daysInMonth; i++) {
      map[i] = { income: 0, expense: 0, list: [] };
    }

    monthTransactions.forEach(t => {
      const day = new Date(t.date).getDate();
      if (map[day]) {
        map[day].list.push(t);
        if (t.type === TransactionType.EXPENSE) {
          map[day].expense += t.amount;
        } else {
          map[day].income += t.amount;
        }
      }
    });
    return map;
  }, [monthTransactions, daysInMonth]);

  // Find max daily expense to calculate intensity
  const maxExpense = Math.max(...Object.values(dayData).map((d: any) => d.expense), 1);

  // Get selected day transactions
  const selectedTransactions = selectedDay ? dayData[selectedDay]?.list || [] : [];

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6 overflow-hidden">
      
      {/* --- Calendar Section --- */}
      <div className="flex-1 flex flex-col bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-950/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
               <CalendarIcon className="w-6 h-6" />
             </div>
             <h2 className="text-xl font-bold text-white capitalize">
               {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
             </h2>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-7 gap-2 md:gap-4 h-full auto-rows-fr">
            {/* Weekday Headers */}
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-neutral-500 uppercase py-2">
                {day}
              </div>
            ))}

            {/* Empty Slots for Start of Month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-transparent" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const data = dayData[day];
              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
              const isSelected = selectedDay === day;
              
              // Calculate Intensity (0 to 1)
              const intensity = Math.min(data.expense / maxExpense, 1);
              
              // Dynamic Background based on Expense Intensity
              // We use rgba to overlay red on the dark background
              const bgStyle = data.expense > 0 
                ? { backgroundColor: `rgba(225, 29, 72, ${0.1 + (intensity * 0.4)})` } // Rose color with variable opacity
                : {};

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={bgStyle}
                  className={`
                    relative min-h-[80px] rounded-xl border transition-all duration-200 flex flex-col justify-between p-2 hover:scale-[1.02]
                    ${isSelected 
                      ? 'border-orange-500 ring-2 ring-orange-500/20 z-10 bg-neutral-800' 
                      : 'border-neutral-800 hover:border-neutral-600 bg-neutral-900/50'
                    }
                    ${isToday ? 'border-orange-500/50' : ''}
                  `}
                >
                   {/* Day Number */}
                   <span className={`text-sm font-semibold ${isToday ? 'text-orange-400' : 'text-neutral-400'}`}>
                     {day}
                   </span>

                   {/* Income Indicator (Dot) */}
                   {data.income > 0 && (
                     <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                   )}

                   {/* Expense Bar / Text */}
                   {data.expense > 0 && (
                     <div className="mt-1">
                        <div className="text-[10px] sm:text-xs font-medium text-rose-300 text-right truncate">
                          - {Math.floor(data.expense)}
                        </div>
                        {/* Visual Bar relative to cell width */}
                        <div className="w-full h-1 bg-neutral-800 rounded-full mt-1 overflow-hidden">
                           <div 
                             className="h-full bg-rose-500 rounded-full" 
                             style={{ width: `${Math.max((data.expense / maxExpense) * 100, 5)}%` }}
                           />
                        </div>
                     </div>
                   )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- Details Sidebar --- */}
      <div className="w-full xl:w-80 flex-shrink-0 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl flex flex-col h-[400px] xl:h-auto overflow-hidden">
        <div className="p-4 border-b border-neutral-800 bg-neutral-950/50">
          <h3 className="text-lg font-bold text-white">
            {selectedDay ? `Detalhes do Dia ${selectedDay}` : 'Selecione um dia'}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            {selectedDay 
              ? `${selectedTransactions.length} transações encontradas` 
              : 'Clique no calendário para ver os gastos.'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
           {selectedDay === null ? (
             <div className="h-full flex flex-col items-center justify-center text-neutral-500 opacity-50">
                <CalendarIcon className="w-12 h-12 mb-2" />
                <span className="text-sm">Nenhum dia selecionado</span>
             </div>
           ) : selectedTransactions.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-neutral-500">
                <span className="text-sm">Sem transações neste dia.</span>
             </div>
           ) : (
             <>
               {/* Daily Summary Card */}
               <div className="bg-neutral-950 rounded-lg p-3 border border-neutral-800 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-neutral-400">Total Entrada</span>
                    <span className="text-sm font-bold text-emerald-400">+ R$ {dayData[selectedDay].income.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral-400">Total Saída</span>
                    <span className="text-sm font-bold text-rose-400">- R$ {dayData[selectedDay].expense.toFixed(2)}</span>
                  </div>
               </div>

               {/* List */}
               {selectedTransactions.map(t => {
                 const style = CATEGORY_STYLES[t.category] || CATEGORY_STYLES['Outros'];
                 const Icon = style.icon;
                 return (
                   <div key={t.id} className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
                      <div className={`p-2 rounded-lg ${style.bgColor}`}>
                        <Icon className={`w-4 h-4 ${style.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{t.description}</p>
                        <p className="text-[10px] text-neutral-400">{t.category}</p>
                      </div>
                      <span className={`text-sm font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-neutral-200'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'} {Math.abs(t.amount).toFixed(0)}
                      </span>
                   </div>
                 );
               })}
             </>
           )}
        </div>
        
        {/* Max Spending Alert */}
        {selectedDay && dayData[selectedDay].expense >= maxExpense && maxExpense > 0 && (
           <div className="p-3 bg-rose-500/10 border-t border-rose-500/20 flex items-start gap-2">
             <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
             <p className="text-xs text-rose-200">
               Este é o dia com maior gasto no mês.
             </p>
           </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;