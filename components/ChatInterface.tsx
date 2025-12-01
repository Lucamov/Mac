import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Trash2 } from 'lucide-react';
import { ChatMessage, MessageRole } from '../types';
import { sendChatMessage } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import LoadingSpinner from './LoadingSpinner';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: MessageRole.MODEL,
      text: "Hello! I'm your AI assistant powered by Gemini 2.5 Flash. How can I help you today?",
      timestamp: Date.now()
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

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role === MessageRole.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const responseText = await sendChatMessage(userMsg.text, history);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: MessageRole.MODEL,
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-950/50 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-indigo-400 flex items-center gap-2">
          <Bot className="w-5 h-5" /> AI Chat
        </h2>
        <button 
          onClick={clearChat}
          className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-slate-800"
          title="Clear Chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === MessageRole.USER ? 'bg-indigo-600' : 'bg-emerald-600'
            }`}>
              {msg.role === MessageRole.USER ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
              msg.role === MessageRole.USER 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
            }`}>
              <ReactMarkdown 
                className="prose prose-invert prose-sm max-w-none"
                components={{
                  code({node, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    return match ? (
                      <div className="bg-slate-950 p-2 rounded my-2 border border-slate-700 overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </div>
                    ) : (
                      <code className="bg-slate-950/50 px-1 py-0.5 rounded text-indigo-300" {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start ml-11">
             <LoadingSpinner text="Gemini is thinking..." />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950/30 border-t border-slate-800">
        <div className="flex items-end gap-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 resize-none outline-none max-h-32 min-h-[44px] py-2.5 px-3"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors mb-0.5"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-center text-slate-600 mt-2">
          Gemini 2.5 Flash can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;