import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-foreground">Entrar</h2>
        <LoginForm />
    </main>
  );
}
