import React, { useState } from 'react';
import { Wallet, ArrowRight, Lock, User as UserIcon } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsLoading(true);
    // Simulate network delay for better UX
    setTimeout(() => {
      onLogin(username.trim());
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <img 
          src="https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=2070&auto=format&fit=crop" 
          alt="Background" 
          className="absolute w-full h-full object-cover opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-3xl shadow-2xl p-8 relative z-10 animate-fade-in-up">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/30 mb-4 transform rotate-3 hover:rotate-6 transition-transform">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Bem-vindo</h1>
          <p className="text-neutral-400">Controle financeiro inteligente.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300 ml-1">Usuário</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-neutral-700 rounded-xl leading-5 bg-neutral-950 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                placeholder="Seu nome ou apelido"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300 ml-1">Senha (Opcional)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                type="password"
                className="block w-full pl-10 pr-3 py-3 border border-neutral-700 rounded-xl leading-5 bg-neutral-950 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Acessando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Entrar na Conta <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
          <p className="text-xs text-neutral-500">
            Seus dados são salvos localmente neste navegador.
            <br/>
            Sempre use o mesmo nome para acessar seus dados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;