"use client";

import { memo } from "react";
import { api } from "~/trpc/react";
import { useMutationHandlers } from "~/hooks/use-error-handler";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import type { Client } from "~/lib/validations/client";

interface DeleteClientDialogProps {
  client: Client | null;
  onClose: () => void;
  onSuccess: () => void;
}

function DeleteClientDialogComponent({
  client,
  onClose,
  onSuccess,
}: DeleteClientDialogProps) {
  const { createMutationHandlers } = useMutationHandlers();

  const deleteMutation = api.client.delete.useMutation({
    ...createMutationHandlers("Cliente excluído com sucesso!"),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const handleDelete = async () => {
    if (!client) return;

    try {
      await deleteMutation.mutateAsync({ id: client.id });
    } catch {
      // Error is handled by the mutation handlers
    }
  };

  const isOpen = !!client;
  const isLoading = deleteMutation.isPending;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Você está prestes a excluir o cliente:{" "}
            <span className="font-semibold text-foreground">
              {client?.name}
            </span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Se este cliente possuir lançamentos de KPI, a exclusão será
            impedida. Neste caso, considere desativar o cliente em vez de
            excluí-lo.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir Cliente
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Memoizar o componente para evitar re-renders desnecessários
export const DeleteClientDialog = memo(DeleteClientDialogComponent);