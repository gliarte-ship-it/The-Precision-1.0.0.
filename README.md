# The Precision

**The Precision** é um aplicativo web de gerenciamento de tempo e lembretes com uma estética editorial refinada, focado em precisão e clareza.

## 🚀 Funcionalidades

- **Gerenciamento de Lembretes**: Crie, edite e acompanhe seus compromissos com facilidade.
- **Lógica de Notificação**: Configure alertas personalizados (5 min, 15 min, 1 hora ou tempo personalizado).
- **Dashboard de Progresso**: Visualize seu progresso diário de tarefas concluídas.
- **Sincronização em Tempo Real**: Seus dados são salvos e sincronizados instantaneamente usando Supabase.
- **Interface Editorial**: Design limpo e tipografia elegante para uma experiência de usuário superior.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS.
- **Animações**: Motion (framer-motion).
- **Backend/Banco de Dados**: Supabase (PostgreSQL, Auth, Real-time).
- **Ícones**: Lucide React.

## 📋 Pré-requisitos

Antes de começar, você precisará configurar um projeto no [Supabase](https://supabase.com/).

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto e adicione suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

## 🚀 Como Executar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🗄️ Estrutura do Banco de Dados

O projeto utiliza as seguintes tabelas no Supabase:

- `profiles`: Armazena informações dos usuários.
- `reminders`: Armazena os lembretes vinculados aos usuários.

As políticas de segurança (RLS) estão configuradas para garantir que cada usuário acesse apenas seus próprios dados.

---
Desenvolvido com precisão.
