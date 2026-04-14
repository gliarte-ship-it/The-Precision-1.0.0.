'use client';

import React, { useState, useEffect } from 'react';
import LayoutShell from '@/components/LayoutShell';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, Clock, History, Calendar, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Trash2 } from 'lucide-react';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function HistoryPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'past' | 'future'>('future');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    } catch (error) {
      console.error('Erro ao excluir lembrete:', error);
    } finally {
      setDeleteId(null);
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

  const exportToPDF = (type: 'past' | 'future') => {
    /*
    const doc = new jsPDF();
    const data = type === 'past' ? pastReminders : futureReminders;
    const title = type === 'past' ? 'Histórico de Lembretes Passados' : 'Agenda de Lembretes Futuros';

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

    const tableData = data.map(r => [
      r.date,
      r.time,
      r.title,
      r.description || '-',
      r.completed ? 'Sim' : 'Não'
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Data', 'Hora', 'Título', 'Descrição', 'Concluído']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [103, 80, 164] }, // Primary color
    });

    doc.save(`lembretes_${type}_${new Date().getTime()}.pdf`);
    */
    console.log('PDF Export disabled for debugging');
  };

  const currentReminders = activeTab === 'past' ? pastReminders : futureReminders;

  return (
    <LayoutShell>
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
        </div>

        {/* Export Button */}
        <button
          onClick={() => exportToPDF(activeTab)}
          disabled={currentReminders.length === 0}
          className="w-full py-4 bg-surface-container-high rounded-2xl flex items-center justify-center gap-3 font-bold text-primary hover:bg-primary/5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-primary/10"
        >
          <Download size={20} />
          Exportar {activeTab === 'past' ? 'Passados' : 'Futuros'} em PDF
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
    </LayoutShell>
  );
}
