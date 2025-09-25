export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="page active flex-col items-center justify-start p-4 pt-16 h-full">
        {children}
    </main>
  );
}
