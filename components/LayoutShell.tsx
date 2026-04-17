'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, CalendarDays, AlarmClock, Bell, Timer, User as UserIcon, Share2, DownloadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import AlertOverlay from '@/components/AlertOverlay';
import { useState, useEffect } from 'react';

interface LayoutShellProps {
  children: React.ReactNode;
}

import { useAuth } from '@/hooks/use-auth';
import { LogIn, LogOut } from 'lucide-react';

import { useReminders } from '@/context/ReminderContext';

export default function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [canInstall, setCanInstall] = useState(false);
  const deferredPrompt = React.useRef<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt.current) {
      // Fallback for browsers that don't support beforeinstallprompt or already installed
      alert('Para instalar, use a opção "Adicionar à tela de início" no menu do seu navegador.');
      return;
    }
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt.current = null;
      setCanInstall(false);
    }
  };

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
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center relative border border-primary/20">
            <Timer className="text-primary" size={24} />
          </div>
          <span className="font-black tracking-tighter text-primary text-xl">The Precision</span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <>
              <Link 
                href="/share"
                className="p-2 rounded-full hover:bg-primary/5 transition-colors text-primary"
                title="Compartilhar Agenda"
              >
                <Share2 size={20} />
              </Link>
              <button 
                onClick={handleInstallClick}
                className="p-2 rounded-full hover:bg-primary/5 transition-colors text-primary"
                title="Instalar App"
              >
                <DownloadCloud size={20} />
              </button>
            </>
          )}
          {user && (
            <Link href="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-primary/10 relative hover:ring-2 hover:ring-primary/20 transition-all">
              <Image
                src={user.user_metadata?.avatar_url || `https://picsum.photos/seed/${user.id}/100/100`}
                alt="User Profile"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </Link>
          )}
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
