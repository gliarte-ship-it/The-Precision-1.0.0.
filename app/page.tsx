'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/hooks/use-auth';
import { useReminders } from '@/context/ReminderContext';
import { Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const { reminders } = useReminders();

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
