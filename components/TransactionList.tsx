import React from 'react';
import { Transaction, TransactionType, ExpenseType, CATEGORY_STYLES } from '../types';
import { Trash, Calendar, Repeat, ShoppingBag } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  const sortedTransactions = [...transactions].sort((a, b) => b.date - a.date);

  return (
    <div className="h-full bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col overflow-hidden shadow-xl">
      <div className="p-6 border-b border-neutral-800 bg-neutral-950/50">
        <h2 className="text-xl font-bold text-white">Histórico Detalhado</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <p>Nenhuma transação registrada ainda.</p>
          </div>
        ) : (
          sortedTransactions.map(t => {
            const style = CATEGORY_STYLES[t.category] || CATEGORY_STYLES['Outros'];
            const Icon = style.icon;

            return (
              <div key={t.id} className="group bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 hover:border-neutral-600 rounded-xl p-4 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Category Icon */}
                  <div className={`p-3 rounded-xl ${style.bgColor}`}>
                    <Icon className={`w-5 h-5 ${style.color}`} />
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium flex items-center gap-2">
                      {t.description}
                      {t.type === TransactionType.EXPENSE && (
                        <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${
                          t.expenseType === ExpenseType.FIXED 
                            ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' 
                            : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                        }`}>
                          {t.expenseType === ExpenseType.FIXED ? 'Fixo' : 'Esporádico'}
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                      <span className="opacity-75">{t.category}</span>
                      <span className="w-1 h-1 bg-neutral-600 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(t.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`font-semibold ${
                    t.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-neutral-200'
                  }`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toFixed(2)}
                  </span>
                  <button 
                    onClick={() => onDelete(t.id)}
                    className="p-2 text-neutral-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Excluir"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TransactionList;