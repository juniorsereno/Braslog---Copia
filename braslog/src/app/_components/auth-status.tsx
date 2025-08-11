"use client";

import { api } from "~/trpc/react";
import { useErrorHandler } from "~/hooks/use-error-handler";
import { useEffect } from "react";

export function AuthStatus() {
  const { handleError } = useErrorHandler();
  const { data: session, isLoading, error } = api.auth.getSession.useQuery();

  // Demonstração do uso do hook de tratamento de erros
  useEffect(() => {
    if (error) {
      handleError(error, "Erro ao verificar status de autenticação");
    }
  }, [error, handleError]);

  if (isLoading) {
    return (
      <div className="w-full max-w-xs">
        <p className="text-center">Carregando status de autenticação...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs">
      {session?.isAuthenticated ? (
        <div className="text-center">
          <p className="text-green-400 mb-2">✓ Usuário autenticado</p>
          <p className="text-sm text-white/80">Email: {session.user?.email}</p>
          <p className="text-xs text-white/60 mt-1">
            ID: {session.user?.id}
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-red-400 mb-2">✗ Usuário não autenticado</p>
          <p className="text-sm text-white/80">
            Faça login para acessar o sistema
          </p>
        </div>
      )}
    </div>
  );
}