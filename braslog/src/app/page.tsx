import Link from "next/link";

import { AuthStatus } from "~/app/_components/auth-status";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  // Test the auth session
  const session = await api.auth.getSession();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Sistema de <span className="text-[hsl(280,100%,70%)]">Análise</span> Logística
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/dashboard"
            >
              <h3 className="text-2xl font-bold">Dashboard →</h3>
              <div className="text-lg">
                Acesse o painel principal para gerenciar seus KPIs logísticos.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/login"
            >
              <h3 className="text-2xl font-bold">Login →</h3>
              <div className="text-lg">
                Faça login para acessar o sistema de análise logística.
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              Status da Autenticação: {session.isAuthenticated ? "Logado" : "Não logado"}
            </p>
            {session.user && (
              <p className="text-lg text-white/80">
                Usuário: {session.user.email}
              </p>
            )}
          </div>

          <AuthStatus />
        </div>
      </main>
    </HydrateClient>
  );
}