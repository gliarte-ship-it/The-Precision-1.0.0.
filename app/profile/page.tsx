'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Camera, Save, ArrowLeft, Loader2, LogOut, Mail, User as UserIcon, Info, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: '',
    bio: '',
  });

  useEffect(() => {
    setMounted(true);
    if (user) {
      setFormData({
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        bio: user.user_metadata?.bio || '',
      });
    }
  }, [user]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para enviar.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('bucket not found') || (uploadError as any).status === 404) {
          throw new Error('Configuração Necessária: O bucket "avatars" não foi encontrado no seu Supabase. Por favor, crie um bucket público chamado "avatars" no painel do Supabase.');
        }
        if (uploadError.message.includes('violates row-level security policy')) {
          throw new Error('Erro de Permissão (RLS): O Supabase bloqueou o upload. Você precisa adicionar uma política (Policy) no bucket "avatars" permitindo "INSERT" para usuários autenticados no painel do Supabase.');
        }
        throw uploadError;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      
    } catch (err: any) {
      console.error('Erro no upload:', err);
      setError(err.message || 'Erro ao fazer upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          bio: formData.bio,
        },
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-6 right-6 z-[100] bg-red-500 text-white px-6 py-4 rounded-2xl font-bold shadow-xl flex items-start gap-3"
          >
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm leading-tight">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-2 text-[10px] uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
              >
                Entendi
              </button>
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2"
          >
            <Save size={18} />
            Perfil atualizado com sucesso!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:bg-primary/5 text-primary">
            <ArrowLeft size={24} />
          </Link>
          <span className="font-bold text-primary tracking-[0.1em] uppercase text-xs">Identidade Chronos</span>
        </div>
        <h2 className="font-bold text-5xl tracking-tight text-on-surface leading-none mb-4">
          Seu Perfil
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed opacity-80">
          Personalize sua presença na cronografia editorial.
        </p>
      </section>

      <div className="space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4 p-8 bg-surface-container-low rounded-[3rem] editorial-shadow border border-white/20">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl relative bg-surface-container-highest">
              {uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                  <Loader2 className="animate-spin text-white" size={32} />
                </div>
              ) : null}
              <Image
                src={formData.avatar_url || `https://picsum.photos/seed/${user?.id}/200/200`}
                alt="Avatar"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
              <div className="text-center">
                <Camera className="text-white mx-auto" size={32} />
                <span className="text-[8px] text-white font-black uppercase tracking-tighter">Upload</span>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-on-surface">{formData.full_name || 'Usuário Chronos'}</h3>
            <p className="text-sm text-on-surface-variant font-medium">{user?.email}</p>
            <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest mt-2">Toque na foto para alterar</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-widest uppercase text-primary ml-1">
              Nome Completo
            </label>
            <div className="relative flex items-center">
              <UserIcon size={20} className="absolute left-4 text-outline z-10 pointer-events-none" />
              <input
                className="w-full pl-12 pr-6 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Seu nome completo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-widest uppercase text-primary ml-1">
              URL do Avatar
            </label>
            <div className="relative flex items-center">
              <Camera size={20} className="absolute left-4 text-outline z-10 pointer-events-none" />
              <input
                className="w-full pl-12 pr-6 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                type="text"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://exemplo.com/foto.jpg"
              />
            </div>
            <p className="text-[10px] text-slate-400 ml-1 font-medium italic">Insira um link para sua imagem de perfil.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold tracking-widest uppercase text-primary ml-1">
              Biografia / Nota Pessoal
            </label>
            <div className="relative flex items-start">
              <Info size={20} className="absolute left-4 top-4 text-outline z-10 pointer-events-none" />
              <textarea
                className="w-full pl-12 pr-6 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all resize-none"
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Conte-nos um pouco sobre sua rotina..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 pt-4">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Salvar Alterações
          </button>
          
          <button 
            onClick={() => logout()}
            className="w-full py-5 bg-surface-container-high text-secondary font-bold rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <LogOut size={20} />
            Encerrar Sessão
          </button>
        </div>
      </div>
    </>
  );
}
