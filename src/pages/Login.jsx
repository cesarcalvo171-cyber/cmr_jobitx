import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageSquare, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 font-sans relative overflow-hidden">
      {/* Background accents */}
      

      <div className="z-10 w-full max-w-md p-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Logo area */}
          <div className="flex flex-col items-center mb-8">
            
            <h1 className="text-2xl font-bold text-white tracking-tight">Kyvorix</h1>
            <div className="flex items-center gap-2 mt-2">
              <h2 className="text-lg font-extralight text-white">Inicio de Sesión</h2>
              
            </div>
           
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></div>
                {error === 'Invalid login credentials' ? 'Credenciales incorrectas' : error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500 outline-none transition-all"
                  placeholder="ejemplo@empresa.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Ingresar <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

        </div>
        <p className="text-center text-slate-500 text-xs mt-6">
          &copy; created by Jobitx {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
