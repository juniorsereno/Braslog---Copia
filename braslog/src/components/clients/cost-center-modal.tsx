"use client";

import { useEffect, memo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { CostCenter } from "~/lib/validations/cost-center";

const CostCenterFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  status: z.enum(["ATIVO", "INATIVO"]),
});

type CostCenterFormData = z.infer<typeof CostCenterFormSchema>;

interface CostCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  costCenter?: CostCenter | null;
}

function CostCenterModalComponent({ isOpen, onClose, costCenter }: CostCenterModalProps) {
  const { createMutationHandlers } = useMutationHandlers();
  const queryClient = useQueryClient();

  const isEditing = !!costCenter;
  const title = isEditing ? "Editar Centro de Custo" : "Novo Centro de Custo";
  const description = isEditing
    ? "Atualize as informações do centro de custo"
    : "Adicione um novo centro de custo";

  const form = useForm<CostCenterFormData>({
    resolver: zodResolver(CostCenterFormSchema),
    defaultValues: { name: "", status: "ATIVO" },
  });

  useEffect(() => {
    if (isOpen) {
      if (costCenter) {
        form.reset({ name: costCenter.name, status: costCenter.status });
      } else {
        form.reset({ name: "", status: "ATIVO" });
      }
    }
  }, [costCenter, isOpen, form]);

  const createMutation = api.costCenter.create.useMutation({
    ...createMutationHandlers("Centro de custo criado com sucesso!"),
    onSuccess: async () => {
      // invalidar listagens para aparecer nas seleções
      try {
        await queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey.some((k) => k === "costCenter" || k === "costCenter.getAll"),
        });
      } catch {}
      form.reset();
      onClose();
    },
  });

  const updateMutation = api.costCenter.update.useMutation({
    ...createMutationHandlers("Centro de custo atualizado com sucesso!"),
    onSuccess: async () => {
      try {
        await queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey.some((k) => k === "costCenter" || k === "costCenter.getAll"),
        });
      } catch {}
      onClose();
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (data: CostCenterFormData) => {
    try {
      if (isEditing && costCenter) {
        await updateMutation.mutateAsync({ id: costCenter.id, name: data.name, status: data.status });
      } else {
        await createMutation.mutateAsync({ name: data.name, status: data.status });
      }
    } catch {
      // handled
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

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
                  <FormLabel>Nome do Centro</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do centro" {...field} disabled={isLoading} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isEditing ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export const CostCenterModal = memo(CostCenterModalComponent);


