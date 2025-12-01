import React, { useState, useRef } from 'react';
import { Mic, Send, X, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { parseTransactionsFromNaturalLanguage } from '../services/geminiService';
import { Transaction, TransactionType, ExpenseType } from '../types';

interface SmartEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransactions: (transactions: Transaction[]) => void;
}

const SmartEntryModal: React.FC<SmartEntryModalProps> = ({ isOpen, onClose, onAddTransactions }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  if (!isOpen) return null;

  const handleProcess = async (text: string, audioBase64?: string) => {
    setIsProcessing(true);
    try {
      const results = await parseTransactionsFromNaturalLanguage(text, audioBase64);
      
      if (Array.isArray(results) && results.length > 0) {
        const newTransactions: Transaction[] = results.map((item: any) => ({
          id: Date.now().toString() + Math.random().toString().slice(2, 5),
          description: item.description || 'Despesa sem nome',
          amount: Number(item.amount) || 0,
          type: item.type === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE,
          category: item.category || 'Outros',
          expenseType: item.expenseType === 'FIXED' ? ExpenseType.FIXED : ExpenseType.SPORADIC,
          date: Date.now()
        }));
        
        onAddTransactions(newTransactions);
        onClose();
        setInputText('');
      } else {
        alert("Não consegui identificar nenhuma transação válida.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao processar. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = (reader.result as string).split(',')[1];
          handleProcess("", base64Audio);
        };
        reader.readAsDataURL(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Erro ao acessar microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 bg-gradient-to-br from-orange-900/20 to-amber-900/20">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Smart Entry
          </h2>
          <p className="text-sm text-slate-300">
            Descreva seus gastos ou cole uma mensagem do WhatsApp. A IA fará o resto.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ex: 'Almoço 45 reais e Uber 20 reais' ou cole uma conversa..."
            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
          />

          <div className="flex gap-3">
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isProcessing}
              className={`flex-1 flex flex-col items-center justify-center py-4 rounded-xl border transition-all select-none ${
                isRecording 
                  ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Mic className={`w-6 h-6 mb-1 ${isRecording ? 'text-red-400' : ''}`} />
              <span className="text-xs font-medium">Segure para Falar</span>
            </button>

            <button
              onClick={() => handleProcess(inputText)}
              disabled={!inputText.trim() || isProcessing}
              className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex flex-col items-center justify-center py-4 transition-all"
            >
              {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin mb-1" />
              ) : (
                <Send className="w-6 h-6 mb-1" />
              )}
              <span className="text-xs font-medium">
                {isProcessing ? 'Processando...' : 'Enviar Texto'}
              </span>
            </button>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3 flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-emerald-400 mt-0.5" />
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-emerald-400 block mb-1">Dica WhatsApp:</span>
              Você pode copiar várias mensagens de gastos do WhatsApp e colar aqui. O Gemini vai separar cada gasto automaticamente.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartEntryModal;