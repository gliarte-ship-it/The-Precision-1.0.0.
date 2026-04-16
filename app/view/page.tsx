'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, CheckCircle2, AlertCircle, Timer, Loader2 } from 'lucide-react';
import Link from 'next/link';

function ViewContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('u');
  const start = searchParams.get('s');
  const end = searchParams.get('e');
  const userName = searchParams.get('n');

  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !start || !end) return;

    const fetchSharedData = async () => {
      setLoading(true);
      setErrorStatus(null);
      
      try {
        const { data, error } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', userId)
          .gte('date', start)
          .lte('date', end)
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        if (error) {
          console.error('Erro Supabase:', error);
          setErrorStatus(error.message);
        } else if (data) {
          setReminders(data);
        }
      } catch (err: any) {
        console.error('Erro Inesperado:', err);
        setErrorStatus(err.message || 'Erro ao conectar ao banco de dados.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedData();
  }, [userId, start, end]);

  if (!userId || !start || !end) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <AlertCircle className="mx-auto text-red-500" size={64} />
          <h1 className="text-3xl font-black tracking-tight">Parâmetros ausentes</h1>
          <p className="text-on-surface-variant">O link de compartilhamento não contém as informações necessárias para renderizar a agenda.</p>
          <Link href="/" className="inline-block py-3 px-8 bg-primary text-white font-bold rounded-2xl">Voltar ao Início</Link>
        </div>
      </div>
    );
  }

  if (errorStatus) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 bg-white p-10 rounded-[3rem] editorial-shadow border border-red-100">
          <AlertCircle className="mx-auto text-red-500" size={64} />
          <h1 className="text-2xl font-black tracking-tight text-on-surface">Erro de Sincronia</h1>
          <p className="text-on-surface-variant font-medium">{errorStatus}</p>
          <div className="p-4 bg-red-50 rounded-2xl text-[10px] text-red-800 font-mono text-left overflow-auto">
            Dica: Verifique as políticas de RLS (Row Level Security) no Supabase para permitir leitura pública com base no user_id.
          </div>
          <Link href="/" className="inline-block mt-4 py-3 px-8 bg-primary text-white font-bold rounded-2xl">Entendi</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="glass editorial-shadow px-6 py-8 flex flex-col items-center text-center space-y-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Timer className="text-primary" size={24} />
          <span className="font-black tracking-tighter text-primary text-xl">The Precision</span>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-on-surface">Agenda de {userName}</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mt-1">
            Cronometria: {start.split('-').reverse().join('/')} — {end.split('-').reverse().join('/')}
          </p>
        </div>
        <div className="px-5 py-2 bg-primary/10 rounded-full border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest shadow-sm">
          Vista de Acesso Público
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.3em]">Recuperando Cronogramas...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-24 bg-surface-container-low rounded-[4rem] border-2 border-dashed border-outline-variant/30 space-y-6 flex flex-col items-center">
            <div className="w-20 h-20 bg-surface-container-highest rounded-full flex items-center justify-center">
              <Calendar className="text-outline/40" size={40} />
            </div>
            <div className="space-y-1">
              <p className="text-on-surface font-black text-xl">Lacuna Cronográfica</p>
              <p className="text-on-surface-variant font-medium text-sm">Nenhum evento registrado para este intervalo.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reminders.length} Registros Encontrados</span>
            </div>
            {reminders.map((reminder, idx) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-8 rounded-[3rem] editorial-shadow border border-slate-100 group hover:border-primary/20 transition-all"
              >
                <div className="flex gap-6">
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                    <span className="text-lg font-black text-primary leading-none">{reminder.time}</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter text-slate-300">GMT-3</span>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xl text-on-surface tracking-tight leading-tight">{reminder.title}</h4>
                      {reminder.completed && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[8px] font-black uppercase">
                          <CheckCircle2 size={10} /> Concluído
                        </div>
                      )}
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-on-surface-variant leading-relaxed opacity-70">
                        {reminder.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        <Calendar size={12} />
                        {reminder.date.split('-').reverse().join('/')}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-12 opacity-30">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">The Precision Editorial System</p>
      </footer>
    </div>
  );
}

export default function ViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    }>
      <ViewContent />
    </Suspense>
  );
}
