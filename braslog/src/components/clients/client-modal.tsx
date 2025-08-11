"use client";

import { useState, useEffect, memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { useMutationHandlers } from "~/hooks/use-error-handler";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import type { Client } from "~/lib/validations/client";
import { api as trpc } from "~/trpc/react";

// Schema simplificado para o formulário
const ClientFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  status: z.enum(["ATIVO", "INATIVO"]),
  costCenterId: z.string().uuid().nullable().optional(),
  isKeyAccount: z.boolean(),
});

type ClientFormData = z.infer<typeof ClientFormSchema>;

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
}

function ClientModalComponent({ isOpen, onClose, client }: ClientModalProps) {
  const [isValidatingName, setIsValidatingName] = useState(false);
  const { createMutationHandlers } = useMutationHandlers();
  const { data: costCentersData } = trpc.costCenter.getAll.useQuery({ limit: 100, offset: 0 }, { staleTime: 5 * 60 * 1000 });

  const isEditing = !!client;
  const title = isEditing ? "Editar Cliente" : "Novo Cliente";
  const description = isEditing
    ? "Atualize as informações do cliente"
    : "Adicione um novo cliente ao sistema";

  // Form setup
  const form = useForm<ClientFormData>({
    resolver: zodResolver(ClientFormSchema),
    defaultValues: {
      name: "",
      status: "ATIVO",
      costCenterId: null,
      isKeyAccount: false,
    },
  });

  // Reset form when client changes
  useEffect(() => {
    if (isOpen) {
      if (client) {
        form.reset({
          name: client.name,
          status: client.status,
          costCenterId: client.costCenterId ?? null,
          isKeyAccount: client.isKeyAccount ?? false,
        });
      } else {
        form.reset({
          name: "",
          status: "ATIVO",
          costCenterId: null,
          isKeyAccount: false,
        });
      }
    }
  }, [client, isOpen, form]);

  // Mutations
  const createMutation = api.client.create.useMutation({
    ...createMutationHandlers("Cliente criado com sucesso!"),
    onSuccess: () => {
      form.reset();
      onClose();
    },
  });

  const updateMutation = api.client.update.useMutation({
    ...createMutationHandlers("Cliente atualizado com sucesso!"),
    onSuccess: () => {
      onClose();
    },
  });

  // Name validation query
  const validateNameQuery = api.client.validateUniqueName.useQuery(
    {
      name: form.watch("name"),
      excludeId: client?.id,
    },
    {
      enabled: false, // Manual trigger
    }
  );

  const handleSubmit = async (data: ClientFormData) => {
    try {
      if (isEditing && client) {
        await updateMutation.mutateAsync({
          id: client.id,
          name: data.name,
          status: data.status,
          costCenterId: data.costCenterId ?? undefined,
          isKeyAccount: data.isKeyAccount,
        });
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          status: data.status,
          costCenterId: data.costCenterId ?? undefined,
          isKeyAccount: data.isKeyAccount,
        });
      }
    } catch {
      // Error is handled by the mutation handlers
    }
  };

  const handleNameBlur = async () => {
    const name = form.getValues("name");
    if (name && name.trim().length > 0) {
      setIsValidatingName(true);
      try {
        const result = await validateNameQuery.refetch();
        if (result.data && !result.data.isUnique) {
          form.setError("name", {
            type: "manual",
            message: result.data.message,
          });
        }
      } catch {
        // Validation error will be handled by the form
      } finally {
        setIsValidatingName(false);
      }
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Digite o nome do cliente"
                        {...field}
                        onBlur={() => {
                          field.onBlur();
                          void handleNameBlur();
                        }}
                        disabled={isLoading}
                      />
                      {isValidatingName && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ATIVO">Ativo</SelectItem>
                      <SelectItem value="INATIVO">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="costCenterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Centro de Custo</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === "__NONE__" ? null : v)}
                    value={field.value ?? "__NONE__"}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um centro (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__NONE__">Sem Centro</SelectItem>
                      {(costCentersData?.costCenters ?? []).map((cc) => (
                        <SelectItem key={cc.id} value={cc.id}>{cc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isKeyAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mostrar individualmente no histórico</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === 'true')}
                    value={String(field.value)}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="false">Não</SelectItem>
                      <SelectItem value="true">Sim</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Memoizar o componente para evitar re-renders desnecessários
export const ClientModal = memo(ClientModalComponent);