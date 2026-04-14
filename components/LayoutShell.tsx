'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, CalendarDays, AlarmClock, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import AlertOverlay from '@/components/AlertOverlay';

interface LayoutShellProps {
  children: React.ReactNode;
}

import { useAuth } from '@/hooks/use-auth';
import { LogIn, LogOut } from 'lucide-react';

import { useReminders } from '@/context/ReminderContext';

export default function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();
  const { user, login, logout } = useAuth();
  const { dailyProgress } = useReminders();

  const navItems = [
    { name: 'Início', icon: LayoutDashboard, href: '/' },
    { name: 'Agendar', icon: PlusCircle, href: '/create' },
    { name: 'Calendário', icon: CalendarDays, href: '/schedule' },
    { name: 'Lembretes', icon: AlarmClock, href: '/history' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AlertOverlay />
      {/* Top Bar */}
      <header className="fixed top-0 left-0 w-full z-50 glass editorial-shadow px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary-container flex items-center justify-center relative">
            {user ? (
              <Image
                src={user.user_metadata?.avatar_url || "https://picsum.photos/seed/professional/100/100"}
                alt="User Profile"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <LayoutDashboard className="text-primary" />
            )}
          </div>
          <span className="font-black tracking-tighter text-primary text-xl">The Precision</span>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <button 
              onClick={() => logout()}
              className="p-2 rounded-full hover:bg-primary/5 transition-colors text-primary"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          ) : (
            <Link 
              href="/auth"
              className="p-2 rounded-full hover:bg-primary/5 transition-colors text-primary"
              title="Entrar"
            >
              <LogIn size={20} />
            </Link>
          )}
        </div>
        
        {/* Chronographic Sync Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-outline-variant/20">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${dailyProgress}%` }}
            className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-32 px-6 max-w-2xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 glass rounded-t-3xl editorial-shadow px-4 pb-8 pt-4 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-br from-primary to-primary-container text-white scale-105'
                  : 'text-slate-500 hover:bg-primary/5'
              }`}
            >
              <item.icon size={isActive ? 24 : 22} />
              <span className="text-[10px] font-bold tracking-wider uppercase mt-1">
                {item.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
