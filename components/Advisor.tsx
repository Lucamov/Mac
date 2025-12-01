import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Trash2, PieChart } from 'lucide-react';
import { Transaction } from '../types';
import { sendFinancialChatMessage, getFinancialHealthCheck } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from './LoadingSpinner';

interface AdvisorProps {
  transactions: Transaction[];
}

const Advisor: React.FC<AdvisorProps> = ({ transactions }) => {
  const [messages, setMessages] = useState<{id: string, role: string, text: string}[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Olá! Sou seu consultor financeiro. Posso analisar seus gastos, sugerir cortes ou explicar conceitos de investimento. Como posso ajudar seu bolso hoje?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendFinancialChatMessage(userMsg.text, history, transactions);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Desculpe, tive um problema ao analisar seus dados. Tente novamente.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const report = await getFinancialHealthCheck(transactions);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: report
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 rounded-xl overflow-hidden shadow-2xl border border-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-neutral-950/50 border-b border-neutral-800">
        <h2 className="text-lg font-semibold text-orange-400 flex items-center gap-2">
          <Bot className="w-5 h-5" /> Gemini Advisor
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={generateReport}
            disabled={isLoading || transactions.length === 0}
            className="text-xs bg-orange-600/20 text-orange-300 hover:bg-orange-600/30 px-3 py-1.5 rounded-full border border-orange-500/30 transition-all flex items-center gap-1"
          >
            <PieChart className="w-3 h-3" /> Gerar Relatório
          </button>
          <button 
            onClick={() => setMessages([])}
            className="text-neutral-500 hover:text-red-400 transition-colors p-1.5 rounded-full hover:bg-neutral-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-orange-600' : 'bg-emerald-600'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
            </div>
            
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-orange-600 text-white rounded-tr-none' 
                : 'bg-neutral-800 text-neutral-200 rounded-tl-none border border-neutral-700'
            }`}>
              <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start ml-11">
             <LoadingSpinner text="Analisando suas finanças..." />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-neutral-950/30 border-t border-neutral-800">
        <div className="flex items-end gap-2 bg-neutral-800/50 p-2 rounded-xl border border-neutral-700 focus-within:border-orange-500 transition-all">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ex: Quanto gastei com comida? Devo investir?"
            className="flex-1 bg-transparent text-neutral-100 placeholder-neutral-500 outline-none py-2.5 px-3"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-neutral-700 text-white rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Advisor;