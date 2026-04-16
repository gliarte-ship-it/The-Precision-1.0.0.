'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, MoreVertical, Lock, BarChart3, Clock, Loader2, Trash2, CheckCircle, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import ConfirmationModal from '@/components/ConfirmationModal';
import Link from 'next/link';

export default function Schedule() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Calendar State
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentMonthDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDayIndex = startDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  
  const prevMonthDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth() - 1);
  
  const calendarDays = Array.from({ length: currentMonthDays }, (_, i) => i + 1);
  const prevDays = Array.from({ length: firstDayIndex }, (_, i) => prevMonthDays - firstDayIndex + i + 1);

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           viewDate.getMonth() === today.getMonth() && 
           viewDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return day === selectedDate.getDate() && 
           viewDate.getMonth() === selectedDate.getMonth() && 
           viewDate.getFullYear() === selectedDate.getFullYear();
  };

  const hasReminder = (day: number) => {
    const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reminders.some(r => r.date === dateStr);
  };

  const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Stats Calculation
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedDayReminders = reminders.filter(r => r.date === selectedDateStr);
  const completedCount = selectedDayReminders.filter(r => r.completed).length;
  const totalCount = selectedDayReminders.length;
  
  const focusScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // Free Time Calculation (Simplified: 16 hours awake - 1.5h per task)
  const estimatedFreeTime = Math.max(0, 16 - (totalCount * 1.5)).toFixed(1);

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
      .channel('reminders_schedule')
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

  const toggleComplete = async (reminderId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ completed: !currentStatus })
        .eq('id', reminderId);
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar lembrete:', error);
    }
  };

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
      {/* Calendar Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-primary font-bold tracking-widest text-[10px] uppercase">Vista Chronos</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">
              {capitalizedMonth}
            </h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={prevMonth}
              className="p-3 bg-surface-container-low rounded-2xl text-primary hover:bg-surface-container-high transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextMonth}
              className="p-3 bg-surface-container-low rounded-2xl text-primary hover:bg-surface-container-high transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-surface-container-low rounded-[32px] p-8 editorial-shadow">
          <div className="grid grid-cols-7 gap-y-8 text-center">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {day}
              </div>
            ))}
            {prevDays.map((day, i) => (
              <div key={`prev-${i}`} className="py-2 text-slate-300 opacity-40">
                {day}
              </div>
            ))}
            {calendarDays.map((day) => (
              <button 
                key={day} 
                onClick={() => setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))}
                className="relative py-2 flex flex-col items-center justify-center group"
              >
                {isToday(day) ? (
                  <div className="relative z-10 w-12 h-12 flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-primary rounded-2xl shadow-lg shadow-primary/20" />
                    <span className="relative z-10 text-white font-bold">{day}</span>
                    {hasReminder(day) && (
                      <span className="relative z-10 w-1.5 h-1.5 bg-tertiary-fixed rounded-full mt-1" />
                    )}
                  </div>
                ) : (
                  <div className={`flex flex-col items-center w-12 h-12 justify-center rounded-2xl transition-all ${isSelected(day) ? 'bg-surface-container-highest ring-2 ring-primary/20' : 'hover:bg-surface-container-high'}`}>
                    <span className={`font-semibold ${isSelected(day) ? 'text-primary' : ''}`}>{day}</span>
                    {hasReminder(day) && (
                      <span className="w-1.5 h-1.5 bg-tertiary rounded-full mt-1" />
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="mt-12 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold tracking-tight">
            {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) === new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) 
              ? 'Precisão de Hoje' 
              : `Agenda: ${selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}`}
          </h3>
          <span className="px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-widest">
            {reminders.filter(r => r.date === selectedDate.toISOString().split('T')[0]).length} Eventos
          </span>
        </div>

        <div className="relative pl-8 space-y-10">
          {/* Vertical Timeline Guide */}
          <div className="absolute left-[3px] top-4 bottom-4 w-px bg-outline-variant/30" />
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : reminders.filter(r => r.date === selectedDate.toISOString().split('T')[0]).length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant opacity-60">
              Nenhum compromisso para este dia.
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {reminders
                .filter(r => r.date === selectedDate.toISOString().split('T')[0])
                .map((event, idx) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative group"
                >
                  {!event.completed && (
                    <div className="absolute -left-[33px] top-1.5 w-2 h-10 bg-tertiary rounded-full" />
                  )}
                  {event.completed && (
                    <div className="absolute -left-[31px] top-3 w-1.5 h-1.5 bg-outline-variant rounded-full" />
                  )}
                  
                  <div className="grid grid-cols-[100px_1fr] gap-6 items-start">
                    <div className="pt-1">
                      <p className={`text-sm font-bold ${!event.completed ? 'text-tertiary' : 'text-slate-500'}`}>
                        {event.time}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        {event.completed ? 'Concluído' : 'Ativo'}
                      </p>
                    </div>
                    
                    <div className={`bg-surface-container-lowest p-6 rounded-3xl transition-all ${
                      !event.completed 
                        ? 'shadow-lg border-l-4 border-tertiary-container' 
                        : 'opacity-60'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className={`text-lg font-bold text-on-surface mb-2 ${event.completed ? 'line-through' : ''}`}>
                            {event.title}
                          </h4>
                          <p className="text-sm text-on-surface-variant leading-relaxed">
                            {event.description}
                          </p>
                          <div className="mt-4 flex gap-2">
                            <span className="bg-surface-container-high px-3 py-1 rounded-full text-[10px] font-semibold text-secondary">
                              {event.date}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => toggleComplete(event.id, event.completed)}
                            className={`p-2 rounded-xl transition-colors ${event.completed ? 'text-primary bg-primary/10' : 'text-outline hover:bg-primary/5 hover:text-primary'}`}
                          >
                            <CheckCircle size={18} />
                          </button>
                          <Link
                            href={`/create?id=${event.id}`}
                            className="p-2 text-outline hover:text-primary hover:bg-primary/10 rounded-xl transition-colors flex items-center justify-center"
                            title="Editar lembrete"
                          >
                            <Edit size={18} />
                          </Link>
                          <button 
                            onClick={() => deleteReminder(event.id)}
                            className="p-2 text-outline hover:text-error hover:bg-error/10 rounded-xl transition-colors flex items-center justify-center"
                            title="Excluir lembrete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="mt-12 grid grid-cols-2 gap-4">
        <div className="bg-primary text-on-primary p-6 rounded-[2.5rem] flex flex-col justify-between aspect-square editorial-shadow">
          <BarChart3 size={40} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Pontuação de Foco</p>
            <h5 className="text-4xl font-black">{focusScore}%</h5>
          </div>
        </div>
        <div className="bg-surface-container-high p-6 rounded-[2.5rem] flex flex-col justify-between aspect-square editorial-shadow">
          <Clock size={40} className="text-primary" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Tempo Livre Estimado</p>
            <h5 className="text-4xl font-black text-on-surface">{estimatedFreeTime}h</h5>
          </div>
        </div>
      </section>
    </>
  );
}
