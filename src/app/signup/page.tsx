import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-foreground">Criar Sua Conta</h2>
        <SignupForm />
    </main>
  );
}
