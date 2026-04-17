'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, Clock, History, Calendar, Loader2, CheckCircle, AlertCircle, Filter, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Trash2, DownloadCloud } from 'lucide-react';
import ConfirmationModal from '@/components/ConfirmationModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?message=login_required');
    }
  }, [user, authLoading, router]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'past' | 'future' | 'custom'>('future');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  useEffect(() => {
    if (!user) {
      setReminders([]);
      setLoading(false);
      return;
    }

    const fetchReminders = async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      
      if (!error && data) {
        setReminders(data);
      }
      setLoading(false);
    };

    fetchReminders();

    const channel = supabase
      .channel('reminders_history')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reminders',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchReminders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const deleteReminder = async (reminderId: string) => {
    setDeleteId(reminderId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', deleteId);
      if (error) throw error;
      setReminders(prev => prev.filter(r => r.id !== deleteId));
      setSuccessMessage('Exclusão executada com sucesso.');
    } catch (error: any) {
      console.error('Erro ao excluir lembrete:', error.message || error);
      setErrorMessage(error.message || 'Erro ao excluir lembrete.');
    } finally {
      setDeleteId(null);
      setIsDeleteModalOpen(false);
    }
  };

  const isPast = (reminder: any) => {
    if (reminder.completed) return true;
    const now = new Date();
    const [year, month, day] = reminder.date.split('-').map(Number);
    const [hour, minute] = reminder.time.split(':').map(Number);
    const scheduledDate = new Date(year, month - 1, day, hour, minute);
    return now > scheduledDate;
  };

  const pastReminders = reminders.filter(r => isPast(r));
  const futureReminders = reminders.filter(r => !isPast(r));
  const customReminders = reminders.filter(r => {
    if (!startDate || !endDate) return false;
    return r.date >= startDate && r.date <= endDate;
  });

  const exportToPDF = (type: 'past' | 'future' | 'custom') => {
    try {
      const doc = new jsPDF();
      let data = [];
      let title = '';

      if (type === 'past') {
        data = pastReminders;
        title = 'HISTORICO DE LEMBRETES PASSADOS';
      } else if (type === 'future') {
        data = futureReminders;
        title = 'AGENDA DE LEMBRETES FUTUROS';
      } else {
        data = customReminders;
        title = `RELATORIO DE LEMBRETES (${startDate.split('-').reverse().join('/')} - ${endDate.split('-').reverse().join('/')})`;
      }

      doc.setFontSize(18);
      doc.setTextColor(0, 71, 141); // Primary color theme
      doc.text('THE PRECISION', 14, 22);
      
      doc.setFontSize(14);
      doc.setTextColor(50);
      doc.text(title, 14, 32);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 40);

      const tableData = data.map(r => [
        r.date.split('-').reverse().join('/'),
        r.time,
        r.title,
        r.description || '-',
        r.completed ? 'Concluido' : 'Pendente'
      ]);

      autoTable(doc, {
        startY: 50,
        head: [['Data', 'Hora', 'Titulo', 'Descricao', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [0, 71, 141], 
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [240, 247, 255]
        },
        margin: { top: 50 }
      });

      doc.save(`the_precision_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
      setSuccessMessage('Relatorio PDF gerado com sucesso.');
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error.message || error);
      setErrorMessage('Erro ao gerar o arquivo PDF.');
    }
  };

  const currentReminders = activeTab === 'past' 
    ? pastReminders 
    : activeTab === 'future' 
      ? futureReminders 
      : customReminders;

  return (
    <>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Lembrete"
        message="Esta ação é permanente. O lembrete será removido de sua agenda e histórico."
        confirmText="Excluir"
      />
      <section className="space-y-8">
        <div className="space-y-2">
          <p className="text-primary font-bold tracking-widest text-[10px] uppercase">Relatórios Chronos</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">Histórico & Agenda</h2>
          <p className="text-on-surface-variant opacity-70">Visualize e exporte seus dados temporais com precisão editorial.</p>
        </div>

        {/* Feedback Notifications */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-green-50 text-green-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-green-100 editorial-shadow min-w-[300px]"
            >
              <CheckCircle size={18} />
              {successMessage}
            </motion.div>
          )}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 editorial-shadow min-w-[300px]"
            >
              <AlertCircle size={18} />
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex p-1 bg-surface-container-low rounded-2xl editorial-shadow">
          <button
            onClick={() => setActiveTab('future')}
            className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'future' 
                ? 'bg-primary text-on-primary shadow-lg' 
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <Clock size={16} />
            Futuros ({futureReminders.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'past' 
                ? 'bg-primary text-on-primary shadow-lg' 
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <History size={16} />
            Passados ({pastReminders.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'custom' 
                ? 'bg-primary text-on-primary shadow-lg' 
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <Filter size={16} />
            Personalizado
          </button>
        </div>

        {/* Custom Filter Controls */}
        <AnimatePresence>
          {activeTab === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-surface-container-low p-6 rounded-3xl editorial-shadow border border-primary/10 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60 ml-1">Data Inicial</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60 ml-1">Data Final</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Button */}
        <button
          onClick={() => exportToPDF(activeTab)}
          disabled={currentReminders.length === 0}
          className="w-full py-4 bg-surface-container-high rounded-2xl flex items-center justify-center gap-3 font-bold text-primary hover:bg-primary/5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-primary/10"
        >
          <DownloadCloud size={20} />
          Exportar {activeTab === 'past' ? 'Passados' : activeTab === 'future' ? 'Futuros' : 'Periodo Selecionado'} em PDF
        </button>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : currentReminders.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-low rounded-[32px] border-2 border-dashed border-outline-variant/30 space-y-4">
              <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="text-outline" size={32} />
              </div>
              <p className="text-on-surface-variant font-medium">Nenhum lembrete encontrado nesta categoria.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {currentReminders.map((reminder, idx) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-surface-container-low p-6 rounded-3xl editorial-shadow group hover:bg-surface-container-lowest transition-all border border-transparent hover:border-primary/10"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg text-on-surface">{reminder.title}</h4>
                        {reminder.completed && (
                          <CheckCircle size={16} className="text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {reminder.description || 'Sem descrição adicional.'}
                      </p>
                      <div className="flex gap-3 mt-4">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <Calendar size={12} />
                          {reminder.date}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <Clock size={12} />
                          {reminder.time}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-3 text-outline hover:text-error hover:bg-error/10 rounded-xl transition-all"
                      title="Excluir lembrete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>
    </>
  );
}
