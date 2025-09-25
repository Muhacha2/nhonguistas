'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(1, {
    message: 'Password is required.',
  }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) {
      toast({
        title: 'Firebase Not Configured',
        description:
          'The Firebase authentication service is not available. Please check your environment variables.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push('/feed');
    } catch (error: any) {
      console.error(error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/invalid-credential') {
        description = 'E-mail ou senha inválidos. Por favor, tente novamente.';
      } else {
        description = error.message;
      }
      toast({
        title: 'Erro ao entrar',
        description: description,
        variant: 'destructive',
      });
    }
  }

  return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
        <input {...form.register('email')} type="email" placeholder="E-mail" className="w-full p-4 rounded-xl border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200" required />
        {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
        
        <input {...form.register('password')} type="password" placeholder="Senha" className="w-full p-4 rounded-xl border-2 border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200" required />
        {form.formState.errors.password && <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>}

        <button type="submit" className="w-full py-4 px-6 bg-foreground text-background font-semibold rounded-2xl shadow-lg transition-transform transform hover:scale-105 duration-200">Entrar</button>
        <p className="mt-4 text-center text-foreground">Não tem uma conta?{' '}
          <Link href="/signup" className="underline font-semibold">
            Criar Conta
          </Link>
        </p>
      </form>
  );
}
