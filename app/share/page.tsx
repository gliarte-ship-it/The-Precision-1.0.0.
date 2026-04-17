'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Download, Calendar, ArrowLeft, Loader2, Link as LinkIcon, Check, X, Info } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import LayoutShell from '@/components/LayoutShell';
import DatePicker from 'react-datepicker';
import { format, parse, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useRouter } from 'next/navigation';

export default function SharePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?message=login_required');
    }
  }, [user, authLoading, router]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateShareLink = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // We'll create a simple share record or just encode the params
      // For this implementation, we'll use a URL with encoded parameters
      // In a real production app, we'd save this to a 'shares' table
      const baseUrl = window.location.origin;
      const params = new URLSearchParams({
        u: user.id,
        s: dateRange.start,
        e: dateRange.end,
        n: user.user_metadata?.full_name || 'Usuário Chronos'
      });
      
      const url = `${baseUrl}/view?${params.toString()}`;
      setShareUrl(url);
    } catch (error: any) {
      console.error('Erro ao gerar link:', error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <>
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-primary/5 text-primary">
            <ArrowLeft size={24} />
          </Link>
          <span className="font-bold text-primary tracking-[0.1em] uppercase text-xs">Sincronia Externa</span>
        </div>
        <h2 className="font-bold text-5xl tracking-tight text-on-surface leading-none mb-4">
          Compartilhar Agenda
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed opacity-80">
          Gere um link de visualização segura para seu período escolhido.
        </p>
      </section>

      <div className="space-y-8">
        <div className="bg-surface-container-low p-8 rounded-[3rem] editorial-shadow border border-white/20 space-y-6">
          <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <Info className="text-primary shrink-0 mt-1" size={20} />
            <p className="text-xs text-primary/80 font-medium leading-relaxed">
              O link gerado permitirá que outras pessoas visualizem seus lembretes no período selecionado. 
              <strong> Elas não poderão editar ou excluir nada.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-widest uppercase text-primary ml-1">Data Inicial</label>
              <div className="relative flex items-center">
                <Calendar size={20} className="absolute left-4 text-outline z-10 pointer-events-none" />
                <DatePicker
                  selected={parse(dateRange.start, 'yyyy-MM-dd', new Date())}
                  onChange={(date) => setDateRange({ ...dateRange, start: date ? format(date, 'yyyy-MM-dd') : '' })}
                  dateFormat="dd/MM/yyyy"
                  locale={ptBR}
                  className="w-full pl-12 pr-6 py-4 bg-surface-container-lowest border-none rounded-2xl text-on-surface focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-widest uppercase text-primary ml-1">Data Final</label>
              <div className="relative flex items-center">
                <Calendar size={20} className="absolute left-4 text-outline z-10 pointer-events-none" />
                <DatePicker
                  selected={parse(dateRange.end, 'yyyy-MM-dd', new Date())}
                  onChange={(date) => setDateRange({ ...dateRange, end: date ? format(date, 'yyyy-MM-dd') : '' })}
                  dateFormat="dd/MM/yyyy"
                  locale={ptBR}
                  className="w-full pl-12 pr-6 py-4 bg-surface-container-lowest border-none rounded-2xl text-on-surface focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>
          </div>

          <button
            onClick={generateShareLink}
            disabled={loading}
            className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Share2 size={20} />}
            Gerar Link de Visualização
          </button>
        </div>

        <AnimatePresence>
          {shareUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-container-high p-8 rounded-[3rem] editorial-shadow border border-primary/10 space-y-4"
            >
              <h3 className="text-sm font-black uppercase tracking-widest text-primary">Link Gerado com Sucesso</h3>
              <div className="flex items-center gap-2 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
                <LinkIcon size={18} className="text-outline shrink-0" />
                <input 
                  readOnly 
                  value={shareUrl} 
                  className="bg-transparent border-none outline-none text-xs font-mono text-on-surface-variant w-full overflow-hidden text-ellipsis"
                />
              </div>
              <button
                onClick={copyToClipboard}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                  copied ? 'bg-green-500 text-white' : 'bg-white text-primary border border-primary/20 hover:bg-primary/5'
                }`}
              >
                {copied ? <Check size={20} /> : <Download size={20} />}
                {copied ? 'Copiado!' : 'Copiar Link'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
