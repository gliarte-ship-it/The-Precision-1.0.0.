'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlarmClock, CheckCircle, Clock, Map, Users } from 'lucide-react';
import Image from 'next/image';

interface AlertOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

import { useReminders } from '@/context/ReminderContext';

export default function AlertOverlay() {
  const { activeAlert, dismissAlert } = useReminders();

  if (!activeAlert) return null;

  return (
    <AnimatePresence>
      {activeAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md bg-surface-container-lowest rounded-[32px] shadow-[0_32px_64px_rgba(25,28,33,0.15)] overflow-hidden relative border border-white/20"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary-container" />
            
            <div className="p-8 pt-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
                  <AlarmClock size={32} />
                </div>
                <div>
                  <span className="text-tertiary font-bold tracking-[0.1em] text-[10px] uppercase bg-tertiary-fixed px-2 py-0.5 rounded">
                    Alerta Chronos
                  </span>
                  <p className="text-on-surface-variant font-medium text-sm">Lembrete Programado</p>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <h2 className="text-4xl font-black tracking-tighter text-on-surface leading-tight">
                  {activeAlert.title}
                </h2>
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <AlarmClock size={20} />
                  <span className="text-lg">{activeAlert.time} — {activeAlert.date}</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed text-md font-medium">
                  {activeAlert.description || 'Nenhuma descrição detalhada para este compromisso.'}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={dismissAlert}
                  className="w-full h-16 bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                >
                  <CheckCircle size={24} />
                  <span className="font-bold text-lg">Entendido</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
