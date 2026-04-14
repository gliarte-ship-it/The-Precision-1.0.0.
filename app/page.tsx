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
      <div className="glass p-8 rounded-[2rem] editorial-shadow border border-white/20 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary/60 mb-2">Progresso Diário</h2>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-5xl font-black tracking-tighter text-primary">{Math.round(dailyProgress)}%</span>
            <span className="text-slate-400 font-bold mb-1">concluído</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${dailyProgress}%` }}
              className="h-full bg-primary"
              transition={{ duration: 1.5, ease: "circOut" }}
            />
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/create" className="glass p-6 rounded-3xl editorial-shadow border border-white/20 hover:scale-[1.02] transition-transform group">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
            <Clock size={24} />
          </div>
          <h3 className="font-bold text-lg">Novo Lembrete</h3>
          <p className="text-xs text-slate-400 mt-1">Agende sua próxima tarefa</p>
        </Link>
        <Link href="/schedule" className="glass p-6 rounded-3xl editorial-shadow border border-white/20 hover:scale-[1.02] transition-transform group">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container/30 flex items-center justify-center text-secondary mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="font-bold text-lg">Calendário</h3>
          <p className="text-xs text-slate-400 mt-1">Visualize sua semana</p>
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
