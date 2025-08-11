import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  CreateClientSchema,
  UpdateClientSchema,
  GetClientByIdSchema,
  ListClientsSchema,
  DeleteClientSchema,
  ValidateUniqueNameSchema,
  ClientValidationMessages,
  type Client,
} from "~/lib/validations/client";

// Tipos para dados do Supabase
  interface SupabaseClient {
  id: string;
  name: string;
  status: string;
    cost_center_id?: string | null;
    is_key_account?: boolean;
  created_at: string;
  updated_at: string;
}

export const clientRouter = createTRPCRouter({
  /**
   * Listar todos os clientes com filtros opcionais
   */
  getAll: protectedProcedure
    .input(ListClientsSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { status, search, limit, offset } = input;

        // Construir query usando Supabase client
        let query = ctx.supabase
          .from('clients')
          .select('id, name, status, cost_center_id, is_key_account, created_at, updated_at', { count: 'exact' });

        // Aplicar filtros
        if (status) {
          query = query.eq('status', status);
        }

        if (search && search.trim().length > 0) {
          query = query.ilike('name', `%${search.trim()}%`);
        }

        // Aplicar ordenação e paginação
        query = query
          .order('status', { ascending: true }) // ATIVO primeiro
          .order('name', { ascending: true })
          .range(offset, offset + limit - 1);

        const { data: clients, count: totalCount, error } = await query;

        if (error) {
          console.error("Supabase error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar clientes",
          });
        }

        return {
          clients: (clients ?? []).map((client: SupabaseClient) => ({
            id: client.id,
            name: client.name,
            status: client.status as 'ATIVO' | 'INATIVO',
            costCenterId: client.cost_center_id ?? null,
            isKeyAccount: Boolean(client.is_key_account),
            createdAt: new Date(client.created_at),
            updatedAt: new Date(client.updated_at),
          })) as Client[],
          totalCount: totalCount ?? 0,
          hasMore: offset + limit < (totalCount ?? 0),
        };
      } catch (error) {
        console.error("Error fetching clients:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar clientes",
        });
      }
    }),

  /**
   * Buscar cliente por ID
   */
  getById: protectedProcedure
    .input(GetClientByIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { data: client, error } = await ctx.supabase
          .from('clients')
          .select('id, name, status, cost_center_id, is_key_account, created_at, updated_at')
          .eq('id', input.id)
          .single();

        if (error || !client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: ClientValidationMessages.CLIENT_NOT_FOUND,
          });
        }

        const typedClient = client as SupabaseClient;
        return {
          id: typedClient.id,
          name: typedClient.name,
          status: typedClient.status as 'ATIVO' | 'INATIVO',
          costCenterId: typedClient.cost_center_id ?? null,
          isKeyAccount: Boolean(typedClient.is_key_account),
          createdAt: new Date(typedClient.created_at),
          updatedAt: new Date(typedClient.updated_at),
        } as Client;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error("Error fetching client by ID:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar cliente",
        });
      }
    }),

  /**
   * Criar novo cliente
   */
  create: protectedProcedure
    .input(CreateClientSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verificar se já existe um cliente com o mesmo nome
        const { data: existingClient } = await ctx.supabase
          .from('clients')
          .select('id')
          .eq('name', input.name)
          .single();

        if (existingClient) {
          throw new TRPCError({
            code: "CONFLICT",
            message: ClientValidationMessages.NAME_ALREADY_EXISTS,
          });
        }

        // Criar o cliente
        const { data: client, error } = await ctx.supabase
          .from('clients')
          .insert({
            name: input.name,
            status: input.status,
            cost_center_id: input.costCenterId ?? null,
            is_key_account: input.isKeyAccount ?? false,
          })
          .select('id, name, status, cost_center_id, is_key_account, created_at, updated_at')
          .single();

        if (error || !client) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar cliente",
          });
        }

        const typedClient = client as SupabaseClient;
        return {
          id: typedClient.id,
          name: typedClient.name,
          status: typedClient.status as 'ATIVO' | 'INATIVO',
          costCenterId: typedClient.cost_center_id ?? null,
          isKeyAccount: Boolean(typedClient.is_key_account),
          createdAt: new Date(typedClient.created_at),
          updatedAt: new Date(typedClient.updated_at),
        } as Client;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Error creating client:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar cliente",
        });
      }
    }),

  /**
   * Atualizar cliente existente
   */
  update: protectedProcedure
    .input(UpdateClientSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Verificar se o cliente existe
        const { data: existingClient } = await ctx.supabase
          .from('clients')
          .select('id, name, status, cost_center_id, is_key_account')
          .eq('id', id)
          .single();

        if (!existingClient) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: ClientValidationMessages.CLIENT_NOT_FOUND,
          });
        }

        // Se está atualizando o nome, verificar unicidade
        if (updateData.name && updateData.name !== existingClient.name) {
          const { data: clientWithSameName } = await ctx.supabase
            .from('clients')
            .select('id')
            .eq('name', updateData.name)
            .single();

          if (clientWithSameName && clientWithSameName.id !== id) {
            throw new TRPCError({
              code: "CONFLICT",
              message: ClientValidationMessages.NAME_ALREADY_EXISTS,
            });
          }
        }

        // Atualizar o cliente
        const { data: updatedClient, error } = await ctx.supabase
          .from('clients')
          .update({
            name: updateData.name,
            status: updateData.status,
            cost_center_id: updateData.costCenterId ?? null,
            is_key_account: updateData.isKeyAccount ?? existingClient.is_key_account,
          })
          .eq('id', id)
          .select('id, name, status, cost_center_id, is_key_account, created_at, updated_at')
          .single();

        if (error || !updatedClient) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao atualizar cliente",
          });
        }

        const typedClient = updatedClient as SupabaseClient;
        return {
          id: typedClient.id,
          name: typedClient.name,
          status: typedClient.status as 'ATIVO' | 'INATIVO',
          costCenterId: typedClient.cost_center_id ?? null,
          isKeyAccount: Boolean(typedClient.is_key_account),
          createdAt: new Date(typedClient.created_at),
          updatedAt: new Date(typedClient.updated_at),
        } as Client;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Error updating client:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar cliente",
        });
      }
    }),

  /**
   * Excluir cliente
   */
  delete: protectedProcedure
    .input(DeleteClientSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verificar se o cliente existe
        const { data: existingClient } = await ctx.supabase
          .from('clients')
          .select('id, name')
          .eq('id', input.id)
          .single();

        if (!existingClient) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: ClientValidationMessages.CLIENT_NOT_FOUND,
          });
        }

        // Verificar se o cliente tem entradas de KPI associadas
        const { data: kpiEntries } = await ctx.supabase
          .from('kpi_entries')
          .select('id')
          .eq('client_id', input.id)
          .limit(1);

        if (kpiEntries && kpiEntries.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Não é possível excluir cliente que possui lançamentos de KPI. Desative o cliente em vez de excluí-lo.",
          });
        }

        // Excluir o cliente
        const { error } = await ctx.supabase
          .from('clients')
          .delete()
          .eq('id', input.id);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao excluir cliente",
          });
        }

        return { success: true, message: "Cliente excluído com sucesso" };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Error deleting client:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao excluir cliente",
        });
      }
    }),

  /**
   * Validar se um nome de cliente é único
   */
  validateUniqueName: protectedProcedure
    .input(ValidateUniqueNameSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { name, excludeId } = input;

        let query = ctx.supabase
          .from('clients')
          .select('id')
          .eq('name', name);
        
        // Se estamos editando um cliente, excluir o próprio cliente da verificação
        if (excludeId) {
          query = query.neq('id', excludeId);
        }

        const { data: existingClient } = await query.single();

        return {
          isUnique: !existingClient,
          message: existingClient 
            ? ClientValidationMessages.NAME_ALREADY_EXISTS 
            : "Nome disponível",
        };
      } catch (error) {
        console.error("Error validating unique name:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao validar nome do cliente",
        });
      }
    }),

  /**
   * Obter estatísticas dos clientes
   */
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const [totalResult, activeResult, inactiveResult] = await Promise.all([
          ctx.supabase.from('clients').select('id', { count: 'exact', head: true }),
          ctx.supabase.from('clients').select('id', { count: 'exact', head: true }).eq('status', 'ATIVO'),
          ctx.supabase.from('clients').select('id', { count: 'exact', head: true }).eq('status', 'INATIVO'),
        ]);

        const totalClients = totalResult.count ?? 0;
        const activeClients = activeResult.count ?? 0;
        const inactiveClients = inactiveResult.count ?? 0;

        return {
          total: totalClients,
          active: activeClients,
          inactive: inactiveClients,
        };
      } catch (error) {
        console.error("Error fetching client stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar estatísticas dos clientes",
        });
      }
    }),
});