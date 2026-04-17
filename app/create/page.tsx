'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Calendar, Clock, Bell, Save, X, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import { parse, format } from 'date-fns';

registerLocale('pt-BR', ptBR);

export default function CreateReminder() {
  const router = useRouter();
  const { user, login, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [customAlert, setCustomAlert] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    alert_time: '15 MIN ANTES',
    description: '',
  });

  useEffect(() => {
    setMounted(true);
    
    // Set initial date/time only on client to avoid hydration mismatch
    setFormData(prev => ({
      ...prev,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(/[^0-9:]/g, ''),
    }));

    const params = new URLSearchParams(window.location.search);
    const titleParam = params.get('title');
    const idParam = params.get('id');

    if (idParam) {
      setEditId(idParam);
      fetchReminder(idParam);
    } else if (titleParam) {
      setFormData(prev => ({ ...prev, title: titleParam }));
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?message=login_required');
    }
  }, [user, authLoading, router]);

  const fetchReminder = async (id: string) => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        const alertTime = data.alert_time || '15 MIN ANTES';
        setFormData({
          title: data.title || '',
          date: data.date || '',
          time: data.time || '',
          alert_time: alertTime,
          description: data.description || '',
        });
        
        const presets = ['5 MIN ANTES', '15 MIN ANTES', '1 HORA ANTES'];
        if (!presets.includes(alertTime)) {
          setCustomAlert(alertTime);
        }
      }
    } catch (error: any) {
      console.error('Erro ao buscar lembrete:', error.message || error);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formData.title || !formData.date || !formData.time) return;

    const finalAlertTime = formData.alert_time === 'PERSONALIZADO' ? customAlert : formData.alert_time;

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        description: formData.description,
        alert_time: finalAlertTime,
      };

      if (editId) {
        const { error } = await supabase
          .from('reminders')
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reminders')
          .insert({
            ...payload,
            user_id: user.id,
            completed: false,
          });
        if (error) throw error;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      console.error('Erro detalhado ao salvar lembrete:', error.message || error);
      // Improved error message to avoid circular structure errors
      const errorMessage = error.message || String(error);
      console.error(`Erro ao salvar lembrete: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  const safeParseDate = (dateStr: string, formatStr: string) => {
    try {
      if (!dateStr) return null;
      const parsed = parse(dateStr, formatStr, new Date());
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch (e) {
      return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {authLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-surface-container-highest/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Verificando Cronografia...</p>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[110] bg-primary/10 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="bg-surface-container-low p-12 rounded-[50px] editorial-shadow text-center space-y-6 border-4 border-primary/20">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-primary/40"
              >
                <Save size={48} />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter text-on-surface">Lembrete Salvo</h2>
                <p className="text-on-surface-variant font-medium">Sua cronografia foi atualizada com precisão.</p>
              </div>
              <div className="pt-4">
                <Loader2 className="animate-spin text-primary mx-auto" size={32} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editorial Header Section */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-primary/5 text-primary">
            <ArrowLeft size={24} />
          </Link>
          <span className="font-bold text-primary tracking-[0.1em] uppercase text-xs">Entrada Chronos</span>
        </div>
        <h2 className="font-bold text-5xl tracking-tight text-on-surface leading-none mb-4">
          {editId ? 'Editar Lembrete' : 'Criar Novo Lembrete'}
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed opacity-80">
          {editId ? 'Refine sua cronografia com precisão editorial.' : 'Orquestre seu próximo compromisso com precisão cirúrgica.'}
        </p>
      </section>

      {fetching ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-on-surface-variant font-medium">Carregando dados do lembrete...</p>
        </div>
      ) : (
        <div className="space-y-8">
        {/* Event Name Input */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold tracking-widest uppercase text-primary ml-1">
            Nome do Evento
          </label>
          <div className="relative">
            <input
              className="w-full px-6 py-5 bg-surface-container-highest border-none rounded-2xl text-on-surface text-xl focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant/50"
              placeholder="Sincronização Estratégica Trimestral"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
        </div>

        {/* Date & Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-widest uppercase text-primary ml-1">
              Data de Ocorrência
            </label>
            <div className="relative flex items-center">
              <Calendar size={20} className="absolute left-4 text-outline z-10 pointer-events-none" />
              {mounted && (
                <DatePicker
                  selected={safeParseDate(formData.date, 'yyyy-MM-dd')}
                  onChange={(date) => setFormData({ ...formData, date: date ? format(date, 'yyyy-MM-dd') : '' })}
                  dateFormat="dd/MM/yyyy"
                  locale="pt-BR"
                  withPortal
                  className="w-full pl-12 pr-6 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                  placeholderText="Selecione a data"
                />
              )}
            </div>
          </div>
          {/* Time */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-widest uppercase text-primary ml-1">
              Hora do Evento
            </label>
            <div className="relative flex items-center">
              <Clock size={20} className="absolute left-4 text-outline z-10 pointer-events-none" />
              {mounted && (
                <DatePicker
                  selected={safeParseDate(formData.time, 'HH:mm')}
                  onChange={(date) => setFormData({ ...formData, time: date ? format(date, 'HH:mm') : '' })}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={5}
                  timeCaption="Hora"
                  dateFormat="HH:mm"
                  locale="pt-BR"
                  withPortal
                  className="w-full pl-12 pr-6 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                  placeholderText="Selecione a hora"
                />
              )}
            </div>
          </div>
        </div>

        {/* Alert Logic Zone */}
        <div className="p-8 bg-surface-container-low rounded-3xl space-y-6 editorial-shadow">
          <div className="flex items-center gap-3 mb-2">
            <Bell size={24} className="text-tertiary" />
            <h3 className="font-semibold text-lg text-on-surface">Lógica de Notificação</h3>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-widest uppercase text-tertiary ml-1">
              Tempo de Disparo do Alerta
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['5 MIN ANTES', '15 MIN ANTES', '1 HORA ANTES', 'PERSONALIZADO'].map((option) => {
                const isSelected = formData.alert_time === option || (option === 'PERSONALIZADO' && !['5 MIN ANTES', '15 MIN ANTES', '1 HORA ANTES'].includes(formData.alert_time));
                return (
                  <button
                    key={option}
                    onClick={() => setFormData({ ...formData, alert_time: option })}
                    className={`px-4 py-3 rounded-full font-bold text-[10px] transition-all ${
                      isSelected
                        ? 'bg-primary-container text-white ring-2 ring-primary ring-offset-2'
                        : 'bg-secondary-container text-on-secondary-container hover:bg-primary-container hover:text-white'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {(formData.alert_time === 'PERSONALIZADO' || !['5 MIN ANTES', '15 MIN ANTES', '1 HORA ANTES'].includes(formData.alert_time)) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 pt-4 border-t border-outline-variant/20"
              >
                <label className="block text-[10px] font-bold tracking-widest uppercase text-tertiary ml-1">
                  Especifique o Tempo (ex: 30 MIN ANTES)
                </label>
                <input
                  type="text"
                  className="w-full px-6 py-4 bg-surface-container-lowest border-none rounded-2xl text-on-surface focus:ring-2 focus:ring-primary transition-all placeholder:text-outline-variant/50"
                  placeholder="Ex: 30 MIN ANTES ou 2 DIAS ANTES"
                  value={customAlert}
                  onChange={(e) => setCustomAlert(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Description Area */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold tracking-widest uppercase text-primary ml-1">
            Crônica / Descrição
          </label>
          <textarea
            className="w-full px-6 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline-variant/60 resize-none"
            placeholder="Detalhe brevemente os objetivos e preparativos necessários para este evento..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        </div>
      )}

      {/* Action Bar */}
      {!fetching && (
        <div className="mt-12 flex items-center justify-end gap-4">
          <button 
            onClick={() => router.push('/')}
            className="px-8 py-4 font-bold text-secondary bg-surface-container-high rounded-2xl hover:bg-surface-container-highest transition-colors active:scale-95"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-10 py-4 font-bold text-on-primary bg-gradient-to-br from-primary to-primary-container rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {editId ? 'Atualizar Lembrete' : 'Salvar Lembrete'}
          </button>
        </div>
      )}
    </>
  );
}
