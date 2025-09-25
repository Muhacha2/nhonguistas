'use client';
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-6xl font-extrabold mb-4">Glance</h1>
      <p className="text-xl italic font-light mb-8">“Veja o mundo em um só olhar.”</p>
      <div className="space-y-4 w-full max-w-sm">
        <button onClick={() => router.push('/signup')} className="w-full py-4 px-6 bg-foreground text-background font-semibold rounded-2xl shadow-lg transition-transform transform hover:scale-105 duration-200">Criar Conta</button>
        <button onClick={() => router.push('/login')} className="w-full py-4 px-6 border-2 border-foreground text-foreground font-semibold rounded-2xl transition-transform transform hover:scale-105 duration-200">Entrar</button>
      </div>
    </main>
  );
}
