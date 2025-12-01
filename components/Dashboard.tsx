import React, { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Wand2, PieChart, Repeat, ShoppingBag, ChevronLeft, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { Transaction, TransactionType, ExpenseType, CATEGORIES, CATEGORY_STYLES } from '../types';
import { autoCategorizeTransaction } from '../services/geminiService';
import SmartEntryModal from './SmartEntryModal';
import { DailySporadicChart, CategoryDonutChart } from './Charts';

interface DashboardProps {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onAddMultipleTransactions: (ts: Transaction[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, onAddTransaction, onAddMultipleTransactions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [expenseType, setExpenseType] = useState<ExpenseType>(ExpenseType.SPORADIC);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);
  const [isSmartEntryOpen, setIsSmartEntryOpen] = useState(false);

  // --- Filtering by Month ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentDate.getMonth() && 
             tDate.getFullYear() === currentDate.getFullYear();
    });
  }, [transactions, currentDate]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  // --- Calculations ---

  const totalIncome = filteredTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  // --- Chart Data Preparation ---

  // 1. Daily Sporadic Spending Data
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  const dailySporadicData = useMemo(() => {
    const dailyMap = new Array(daysInMonth).fill(0);
    
    filteredTransactions.forEach(t => {
      if (t.type === TransactionType.EXPENSE && t.expenseType === ExpenseType.SPORADIC) {
        const day = new Date(t.date).getDate(); // 1 to 31
        if (day >= 1 && day <= daysInMonth) {
          dailyMap[day - 1] += t.amount;
        }
      }
    });

    const maxVal = Math.max(...dailyMap);

    return dailyMap.map((amount, index) => ({
      day: index + 1,
      amount,
      isMax: amount > 0 && amount === maxVal
    }));
  }, [filteredTransactions, daysInMonth]);

  const maxSporadicDay = dailySporadicData.find(d => d.isMax);

  // 2. Category Donut Data
  const categoryData = useMemo(() => {
    const expensesByCategory = filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(expensesByCategory)
      .map(([name, val]) => ({
        name,
        amount: val as number,
        percentage: totalExpense > 0 ? ((val as number) / totalExpense) * 100 : 0,
        color: CATEGORY_STYLES[name]?.color || 'text-neutral-400'
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, totalExpense]);

  // --- Handlers ---

  const handleAutoCategorize = async () => {
    if (!description) return;
    setIsAutoCategorizing(true);
    try {
      const cat = await autoCategorizeTransaction(description, Number(amount) || 0);
      setCategory(cat);
      if (['Moradia', 'Educação', 'Investimentos'].includes(cat)) {
        setExpenseType(ExpenseType.FIXED);
      } else {
        setExpenseType(ExpenseType.SPORADIC);
      }
    } finally {
      setIsAutoCategorizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      type,
      expenseType: type === TransactionType.EXPENSE ? expenseType : undefined,
      category,
      date: Date.now()
    };

    onAddTransaction(newTransaction);
    setDescription('');
    setAmount('');
  };

  return (
    <div className="h-full overflow-y-auto space-y-6 p-1 pb-20 custom-scrollbar">
      
      {/* --- Visual Header Banner --- */}
      <div className="relative w-full h-40 rounded-3xl overflow-hidden shadow-2xl border border-neutral-800">
        <img 
          src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop" 
          alt="Gold Finance Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[50%] hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-900/60 to-transparent flex items-center px-8">
           <div className="animate-fade-in-up">
              <h1 className="text-3xl font-bold text-white mb-1 drop-shadow-md">Controle Financeiro</h1>
              <p className="text-orange-200 text-sm font-medium">Seu patrimônio, suas regras.</p>
           </div>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-4 rounded-2xl shadow-lg sticky top-0 z-30 backdrop-blur-md bg-opacity-80">
        <button onClick={prevMonth} className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-orange-400 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-white capitalize flex items-center gap-2">
          {monthName}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-orange-400 transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="text-neutral-400 text-sm font-medium">Saldo Mensal</h3>
          </div>
          <p className={`text-2xl font-bold relative z-10 ${balance >= 0 ? 'text-orange-400' : 'text-red-400'}`}>
            R$ {balance.toFixed(2)}
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-neutral-400 text-sm font-medium">Receitas</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-400 relative z-10">
            R$ {totalIncome.toFixed(2)}
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="p-2 bg-rose-500/20 rounded-lg">
              <TrendingDown className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-neutral-400 text-sm font-medium">Despesas</h3>
          </div>
          <p className="text-2xl font-bold text-rose-400 relative z-10">
            R$ {totalExpense.toFixed(2)}
          </p>
        </div>
      </div>

      {/* --- Main Dashboard Grid --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Add */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Quick Add Form */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
             {/* Smart Entry Button */}
             <div className="absolute top-4 right-4 z-20">
               <button 
                 onClick={() => setIsSmartEntryOpen(true)}
                 className="flex items-center gap-2 px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/40 text-orange-300 rounded-lg text-xs font-medium border border-orange-500/30 transition-all shadow-[0_0_10px_rgba(234,88,12,0.15)]"
               >
                 <Sparkles className="w-3 h-3" /> IA / Audio Input
               </button>
             </div>

             <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2 relative z-10">
               <Plus className="w-5 h-5 text-orange-500" /> Nova Transação
             </h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 relative z-10">
              {/* Type Toggle */}
              <div className="lg:col-span-4 flex bg-neutral-800 rounded-lg p-1 h-[46px]">
                <button
                  type="button"
                  onClick={() => setType(TransactionType.EXPENSE)}
                  className={`flex-1 rounded-md text-sm font-medium transition-all ${
                    type === TransactionType.EXPENSE ? 'bg-rose-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Saída
                </button>
                <button
                  type="button"
                  onClick={() => setType(TransactionType.INCOME)}
                  className={`flex-1 rounded-md text-sm font-medium transition-all ${
                    type === TransactionType.INCOME ? 'bg-emerald-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Entrada
                </button>
              </div>

              {/* Expense Specific Toggle */}
              {type === TransactionType.EXPENSE ? (
                <div className="lg:col-span-8 flex bg-neutral-800 rounded-lg p-1 h-[46px]">
                  <button
                    type="button"
                    onClick={() => setExpenseType(ExpenseType.FIXED)}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all ${
                      expenseType === ExpenseType.FIXED ? 'bg-neutral-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Repeat className="w-3 h-3" /> Fixo
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpenseType(ExpenseType.SPORADIC)}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all ${
                      expenseType === ExpenseType.SPORADIC ? 'bg-neutral-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <ShoppingBag className="w-3 h-3" /> Esporádico
                  </button>
                </div>
              ) : (
                <div className="lg:col-span-8 h-[46px]"></div>
              )}

              <div className="lg:col-span-6 relative">
                <input
                  type="text"
                  placeholder="Descrição (ex: Uber, Aluguel)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => { if(description) handleAutoCategorize() }}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 h-[46px] placeholder-neutral-500"
                  required
                />
                {isAutoCategorizing && (
                  <div className="absolute right-3 top-3">
                    <Wand2 className="w-5 h-5 text-orange-400 animate-pulse" />
                  </div>
                )}
              </div>

              <div className="lg:col-span-3">
                <input
                  type="number"
                  placeholder="Valor (R$)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 h-[46px] placeholder-neutral-500"
                  required
                />
              </div>

              <div className="lg:col-span-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 h-[46px] appearance-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-12 mt-2">
                <button
                  type="submit"
                  className="w-full h-[46px] bg-orange-600 hover:bg-orange-500 text-white rounded-lg flex items-center justify-center transition-colors font-medium shadow-lg shadow-orange-900/20"
                >
                  <Plus className="w-5 h-5 mr-2" /> Adicionar Transação
                </button>
              </div>
            </form>
          </div>

          {/* New Daily Sporadic Chart */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-lg">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-orange-400" /> Picos de Gastos Esporádicos
                </h3>
                {maxSporadicDay && (
                  <div className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-300 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    Maior gasto dia {maxSporadicDay.day}
                  </div>
                )}
             </div>
             
             <div className="text-sm text-neutral-400 mb-6">
                Veja em quais dias do mês você teve gastos não planejados.
             </div>

             <DailySporadicChart data={dailySporadicData} />
          </div>
        </div>

        {/* Right Column: Category Donut Chart */}
        <div className="xl:col-span-1 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl h-fit">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
             <PieChart className="w-5 h-5 text-orange-400" /> Distribuição
          </h3>
          
          <CategoryDonutChart data={categoryData} />

          {/* Mini Legend for Fixed vs Sporadic inside Category card for completeness */}
           <div className="mt-8 pt-6 border-t border-neutral-800">
             <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Resumo do Mês</h4>
             <div className="space-y-3">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-neutral-400 flex items-center gap-2">
                    <Repeat className="w-3 h-3 text-neutral-500" /> Fixos
                 </span>
                 <span className="text-white font-mono">
                   {totalExpense > 0 
                     ? ((filteredTransactions.filter(t=>t.type==='EXPENSE' && t.expenseType==='FIXED').reduce((a,b)=>a+b.amount,0) / totalExpense) * 100).toFixed(0) 
                     : 0}%
                 </span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-neutral-400 flex items-center gap-2">
                    <ShoppingBag className="w-3 h-3 text-neutral-500" /> Esporádicos
                 </span>
                 <span className="text-white font-mono">
                   {totalExpense > 0 
                     ? ((filteredTransactions.filter(t=>t.type==='EXPENSE' && t.expenseType==='SPORADIC').reduce((a,b)=>a+b.amount,0) / totalExpense) * 100).toFixed(0) 
                     : 0}%
                 </span>
               </div>
             </div>
           </div>
        </div>
      </div>
      
      <SmartEntryModal 
        isOpen={isSmartEntryOpen} 
        onClose={() => setIsSmartEntryOpen(false)} 
        onAddTransactions={onAddMultipleTransactions}
      />
    </div>
  );
};

export default Dashboard;