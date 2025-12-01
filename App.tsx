"use client";

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, MessageSquareText, AlertTriangle, LogOut, User as UserIcon, Calendar as CalendarIcon } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Advisor from './components/Advisor';
import CalendarView from './components/CalendarView';
import LoginScreen from './components/LoginScreen';
import { AppTab, Transaction, User } from './types';

const App: React.FC = () => {
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // --- App State ---
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 1. Check for existing session on mount
  useEffect(() => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('gemini-finance-user');
      if (savedUser) {
        setCurrentUser({ username: savedUser, isLoggedIn: true });
      }
    }
    setIsLoadingUser(false);
  }, []);

  // 2. Load data WHENEVER currentUser changes
  useEffect(() => {
    if (currentUser) {
      loadUserData(currentUser.username);
    } else {
      setTransactions([]); // Clear data on logout
    }
  }, [currentUser]);

  // 3. Save data WHENEVER transactions change (if user exists)
  useEffect(() => {
    if (currentUser && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`gemini-data-${currentUser.username}`, JSON.stringify(transactions));
      } catch (e) {
        console.error("Save Error:", e);
      }
    }
  }, [transactions, currentUser]);

  const loadUserData = (username: string) => {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem(`gemini-data-${username}`);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          setTransactions(parsed);
          return;
        }
      }
      // If no data or invalid, start empty
      setTransactions([]);
    } catch (e) {
      console.error("Load Error:", e);
      setTransactions([]);
    }
  };

  const handleLogin = (username: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini-finance-user', username);
    }
    setCurrentUser({ username, isLoggedIn: true });
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gemini-finance-user');
    }
    setCurrentUser(null);
    setActiveTab(AppTab.DASHBOARD);
  };

  const addTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
  };

  const addMultipleTransactions = (ts: Transaction[]) => {
    setTransactions(prev => [...ts, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const clearAllData = () => {
    if (window.confirm("ATENÇÃO: Isso apagará todas as suas transações PERMANENTEMENTE. Deseja continuar?")) {
      setTransactions([]);
      if (currentUser && typeof window !== 'undefined') {
        localStorage.removeItem(`gemini-data-${currentUser.username}`);
      }
    }
  };

  if (isLoadingUser) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-orange-500">Carregando...</div>;
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col lg:flex-row overflow-hidden">
      
      {/* Sidebar Navigation */}
      <nav className="lg:w-64 bg-neutral-900 border-r border-neutral-800 p-4 flex flex-col gap-2 shrink-0 z-20">
        <div className="mb-6 px-2 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-900/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
            Gemini Finance
          </h1>
        </div>

        {/* User Info Card */}
        <div className="mb-4 p-3 bg-neutral-950/50 rounded-xl border border-neutral-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-orange-400" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-neutral-500 font-medium">Conta Atual</p>
            <p className="text-sm text-white font-semibold truncate">{currentUser.username}</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab(AppTab.DASHBOARD)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === AppTab.DASHBOARD 
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
              : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab(AppTab.CALENDAR)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === AppTab.CALENDAR
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
              : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="font-medium">Calendário</span>
        </button>

        <button
          onClick={() => setActiveTab(AppTab.TRANSACTIONS)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === AppTab.TRANSACTIONS 
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
              : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="font-medium">Transações</span>
        </button>

        <button
          onClick={() => setActiveTab(AppTab.ADVISOR)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === AppTab.ADVISOR 
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
              : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <MessageSquareText className="w-5 h-5" />
          <span className="font-medium">Gemini Advisor</span>
        </button>

        <div className="mt-auto space-y-2">
          <button
            onClick={clearAllData}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-neutral-400 hover:bg-red-900/10 hover:text-red-400 transition-all text-sm group"
          >
            <AlertTriangle className="w-4 h-4 group-hover:text-red-400" />
            <span className="font-medium">Resetar Dados</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all text-sm border-t border-neutral-800"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Sair da Conta</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-6 overflow-hidden h-screen bg-neutral-950 relative">
        <div className="h-full w-full max-w-7xl mx-auto">
          {activeTab === AppTab.DASHBOARD && (
            <Dashboard 
              transactions={transactions} 
              onAddTransaction={addTransaction}
              onAddMultipleTransactions={addMultipleTransactions} 
            />
          )}
          {activeTab === AppTab.CALENDAR && (
            <CalendarView transactions={transactions} />
          )}
          {activeTab === AppTab.TRANSACTIONS && (
            <TransactionList transactions={transactions} onDelete={deleteTransaction} />
          )}
          {activeTab === AppTab.ADVISOR && (
            <Advisor transactions={transactions} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;