'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

interface Reminder {
  id: string;
  title: string;
  date: string;
  time: string;
  alert_time: string;
  description: string;
  completed: boolean;
  user_id: string;
}

interface ReminderContextType {
  activeAlert: Reminder | null;
  dismissAlert: () => void;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export function ReminderProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeAlert, setActiveAlert] = useState<Reminder | null>(null);
  const [triggeredAlerts, setTriggeredAlerts] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    const alertSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    alertSound.loop = true;
    audioRef.current = alertSound;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setReminders([]);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    // Initial fetch
    const fetchReminders = async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);
      
      if (!error && data) {
        setReminders(data as Reminder[]);
      }
    };

    fetchReminders();

    // Real-time subscription
    const channel = supabase
      .channel('reminders_today')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reminders',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        // Refresh data on any change for simplicity, or handle payload manually
        fetchReminders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const parseAlertTime = (alertStr: string): number => {
    if (!alertStr) return 0;
    const match = alertStr.match(/(\d+)\s+(MIN|HORA|DIA)/i);
    if (!match) return 0;
    const value = parseInt(match[1]);
    const unit = match[2].toUpperCase();
    if (unit === 'MIN') return value;
    if (unit === 'HORA') return value * 60;
    if (unit === 'DIA') return value * 1440;
    return 0;
  };

  const checkAlerts = useCallback(() => {
    const activeReminders = reminders.filter(r => !r.completed);
    if (!activeReminders.length) return;

    const now = new Date();
    
    activeReminders.forEach(reminder => {
      if (triggeredAlerts.has(reminder.id)) return;

      const [year, month, day] = reminder.date.split('-').map(Number);
      const [hour, minute] = reminder.time.split(':').map(Number);
      const eventDate = new Date(year, month - 1, day, hour, minute);
      
      const minutesBefore = parseAlertTime(reminder.alert_time);
      const alertDate = new Date(eventDate.getTime() - minutesBefore * 60000);

      if (now >= alertDate && now.getTime() - alertDate.getTime() < 60000) {
        setActiveAlert(reminder);
        setTriggeredAlerts(prev => new Set(prev).add(reminder.id));
        
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log('Autoplay blocked or audio error:', e));
        }
      }
    });
  }, [reminders, triggeredAlerts]);

  useEffect(() => {
    const interval = setInterval(checkAlerts, 10000);
    return () => clearInterval(interval);
  }, [checkAlerts]);

  const dismissAlert = () => {
    setActiveAlert(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <ReminderContext.Provider value={{ activeAlert, dismissAlert }}>
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
}
