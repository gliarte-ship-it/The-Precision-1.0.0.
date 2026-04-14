'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = true,
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm bg-surface-container-lowest rounded-[32px] shadow-2xl overflow-hidden relative border border-white/10"
          >
            <div className={`h-2 w-full ${isDanger ? 'bg-error' : 'bg-primary'}`} />
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${isDanger ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                  {isDanger ? <AlertTriangle size={24} /> : <Trash2 size={24} />}
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-outline hover:text-on-surface transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2 mb-8">
                <h3 className="text-2xl font-black tracking-tight text-on-surface">
                  {title}
                </h3>
                <p className="text-on-surface-variant leading-relaxed font-medium text-sm">
                  {message}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`w-full py-4 font-bold rounded-2xl shadow-lg active:scale-95 transition-all ${
                    isDanger 
                      ? 'bg-error text-on-error hover:bg-error/90' 
                      : 'bg-primary text-on-primary hover:bg-primary/90'
                  }`}
                >
                  {confirmText}
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-4 text-outline font-bold hover:text-on-surface transition-colors"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
