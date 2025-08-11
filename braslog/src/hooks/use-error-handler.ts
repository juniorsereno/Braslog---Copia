"use client";

import { toast } from "sonner";
// Removido import não utilizado

/**
 * Hook personalizado para tratamento de erros tRPC
 * Fornece uma função padronizada para exibir erros ao usuário
 */
export const useErrorHandler = () => {
  const handleError = (error: unknown, customMessage?: string) => {
    console.error("Error caught by error handler:", error);

    // Se um erro customizado foi fornecido, use-o
    if (customMessage) {
      toast.error(customMessage);
      return;
    }

    // Tratamento específico para erros tRPC
    if (error && typeof error === "object" && "message" in error) {
      const errorMessage = (error as { message: string }).message;
      
      // Mapear códigos de erro comuns para mensagens amigáveis
      if (errorMessage.includes("UNAUTHORIZED")) {
        toast.error("Você não tem permissão para realizar esta ação");
        return;
      }
      
      if (errorMessage.includes("NOT_FOUND")) {
        toast.error("Registro não encontrado");
        return;
      }
      
      if (errorMessage.includes("CONFLICT")) {
        toast.error("Este registro já existe ou há um conflito de dados");
        return;
      }
      
      if (errorMessage.includes("BAD_REQUEST")) {
        toast.error("Dados inválidos. Verifique as informações e tente novamente");
        return;
      }
      
      // Para outros erros com mensagem, exibir a mensagem
      toast.error(errorMessage);
      return;
    }

    // Erro genérico para casos não mapeados
    toast.error("Ocorreu um erro inesperado. Tente novamente em alguns instantes");
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
  };

  const handleInfo = (message: string) => {
    toast.info(message);
  };

  const handleWarning = (message: string) => {
    toast.warning(message);
  };

  return {
    handleError,
    handleSuccess,
    handleInfo,
    handleWarning,
  };
};

/**
 * Hook específico para operações de mutação tRPC
 * Fornece callbacks padronizados para onSuccess e onError
 */
export const useMutationHandlers = () => {
  const { handleError, handleSuccess } = useErrorHandler();

  const createMutationHandlers = (
    successMessage: string,
    errorMessage?: string
  ) => ({
    onSuccess: () => {
      handleSuccess(successMessage);
    },
    onError: (error: unknown) => {
      handleError(error, errorMessage);
    },
  });

  return { createMutationHandlers };
};