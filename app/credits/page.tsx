'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Mail, ShieldAlert, Copyright, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreditsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-primary/5 text-primary"
          >
            <ArrowLeft size={24} />
          </button>
          <span className="font-bold text-primary tracking-[0.1em] uppercase text-xs">Informações Chronos</span>
        </div>

        <div className="bg-white p-10 rounded-[3rem] editorial-shadow border border-slate-100 space-y-10 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="text-center space-y-4 relative z-10">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Timer className="text-primary" size={40} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-on-surface leading-none">
              The Precision
            </h1>
            <p className="text-sm font-bold text-primary/40 uppercase tracking-[0.3em]">Sistema Editorial v1.0</p>
          </div>

          <div className="space-y-8 relative z-10">
            {/* Developer Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User size={18} className="text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/60">Desenvolvedor</h3>
              </div>
              <div className="pl-7">
                <p className="text-2xl font-black tracking-tight text-on-surface">Gustavo Liarte</p>
                <div className="flex items-center gap-2 mt-1 text-on-surface-variant">
                  <Mail size={14} />
                  <span className="text-sm font-medium">gliarte@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Disclaimer Section */}
            <div className="space-y-4 p-6 bg-red-50 rounded-3xl border border-red-100">
              <div className="flex items-center gap-3">
                <ShieldAlert size={18} className="text-red-500" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-red-600/60">Termos de Uso</h3>
              </div>
              <p className="text-sm leading-relaxed text-red-900/70 font-medium">
                A utilização é livre, não nos responsabilizamos por perda de dados.
              </p>
            </div>

            {/* Copyright Section */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <Copyright size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Todos os direitos reservados!</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center opacity-30">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em]">The Precision Editorial System</p>
        </footer>
      </motion.div>
    </div>
  );
}
