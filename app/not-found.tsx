import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <h1 className="text-6xl font-black text-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-6">Página não encontrada</h2>
      <p className="text-slate-500 mb-8">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link 
        href="/"
        className="px-8 py-3 bg-primary text-white rounded-full font-bold editorial-shadow hover:scale-105 transition-transform"
      >
        Voltar ao Início
      </Link>
    </div>
  );
}
