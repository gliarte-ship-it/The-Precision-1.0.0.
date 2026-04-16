'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/hooks/use-auth';
import { useReminders } from '@/context/ReminderContext';
import { Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { user, login } = useAuth();
  const { dailyProgress } = useReminders();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <h1 className="text-4xl font-black tracking-tighter text-primary mb-6">
            Sincronize sua produtividade com precisão.
          </h1>
          <p className="text-slate-500 mb-8 text-lg">
            Gerencie seu tempo com uma interface editorial refinada e lembretes inteligentes.
          </p>
          <Link
            href="/auth"
            className="px-10 py-4 bg-primary text-white rounded-full font-bold text-lg editorial-shadow hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
          >
            Começar Agora <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tighter text-primary">
          Olá, {displayName?.split(' ')[0]}
        </h1>
        <p className="text-slate-500 font-medium">Sua jornada cronográfica de hoje.</p>
      </header>

      {/* Progress Card */}
      <div className="glass p-10 rounded-[3rem] editorial-shadow border border-white/20 relative overflow-hidden bg-gradient-to-br from-white/80 to-primary/5">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">Cronometria Diária</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-black tracking-tighter text-primary leading-none">
                {Math.round(dailyProgress)}%
              </span>
              <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Sincronizado</span>
            </div>
          </div>
          
          <div className="flex-1 max-w-xs w-full space-y-4">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Eficiência</span>
              <span>{Math.round(dailyProgress)}/100</span>
            </div>
            <div className="w-full h-4 bg-slate-100/50 rounded-full overflow-hidden p-1 border border-white">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${dailyProgress}%` }}
                className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(0,71,141,0.3)]"
                transition={{ duration: 1.5, ease: "circOut" }}
              />
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4">
        <Link href="/create" className="glass p-8 rounded-[2.5rem] editorial-shadow border border-white/20 hover:scale-[1.01] transition-transform group flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <Clock size={32} />
          </div>
          <div>
            <h3 className="font-black text-2xl tracking-tight">Novo Lembrete</h3>
            <p className="text-sm text-slate-400 font-medium">Agende sua próxima tarefa com precisão</p>
          </div>
          <ArrowRight className="ml-auto text-primary/30 group-hover:text-primary transition-colors" size={24} />
        </Link>
      </div>

      {/* Status Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-black tracking-tight text-slate-800 px-2">Status do Sistema</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">Sincronização Ativa</p>
              <p className="text-xs text-slate-400">Seus dados estão seguros no Supabase</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">Notificações Prontas</p>
              <p className="text-xs text-slate-400">Alertas configurados para seu fuso horário</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
