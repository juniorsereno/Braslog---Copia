import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  CreateCostCenterSchema,
  UpdateCostCenterSchema,
  GetCostCenterByIdSchema,
  ListCostCentersSchema,
  DeleteCostCenterSchema,
  type CostCenter,
  CostCenterValidationMessages,
} from "~/lib/validations/cost-center";

interface SupabaseCostCenter {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const costCenterRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(ListCostCentersSchema)
    .query(async ({ ctx, input }) => {
      const { status, search, limit, offset } = input;

      let query = ctx.supabase
        .from('cost_centers')
        .select('id, name, status, created_at, updated_at, clients:clients(count)', { count: 'exact' });

      if (status) query = query.eq('status', status);
      if (search && search.trim().length > 0) query = query.ilike('name', `%${search.trim()}%`);

      query = query.order('status', { ascending: true }).order('name', { ascending: true }).range(offset, offset + limit - 1);

      const { data, count, error } = await query;
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao buscar centros de custo' });

      const items: CostCenter[] = (data ?? []).map((row: any) => {
        const cc = row as SupabaseCostCenter & { clients?: Array<{ count: number }> };
        const clientCount = Array.isArray((cc as any).clients) && (cc as any).clients[0]?.count ? Number((cc as any).clients[0].count) : 0;
        return {
          id: cc.id,
          name: cc.name,
          status: cc.status as 'ATIVO' | 'INATIVO',
          createdAt: new Date(cc.created_at),
          updatedAt: new Date(cc.updated_at),
          clientCount,
        } satisfies CostCenter;
      });

      return { costCenters: items, totalCount: count ?? 0, hasMore: offset + limit < (count ?? 0) };
    }),

  getById: protectedProcedure
    .input(GetCostCenterByIdSchema)
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('cost_centers')
        .select('id, name, status, created_at, updated_at')
        .eq('id', input.id)
        .single();
      if (error || !data) throw new TRPCError({ code: 'NOT_FOUND', message: CostCenterValidationMessages.COST_CENTER_NOT_FOUND });
      const cc = data as SupabaseCostCenter;
      return { id: cc.id, name: cc.name, status: cc.status as 'ATIVO' | 'INATIVO', createdAt: new Date(cc.created_at), updatedAt: new Date(cc.updated_at) } satisfies CostCenter;
    }),

  create: protectedProcedure
    .input(CreateCostCenterSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: existing } = await ctx.supabase.from('cost_centers').select('id').eq('name', input.name).single();
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: CostCenterValidationMessages.NAME_ALREADY_EXISTS });

      const { data, error } = await ctx.supabase
        .from('cost_centers')
        .insert({ name: input.name, status: input.status })
        .select('id, name, status, created_at, updated_at')
        .single();
      if (error || !data) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao criar centro de custo' });
      const cc = data as SupabaseCostCenter;
      return { id: cc.id, name: cc.name, status: cc.status as 'ATIVO' | 'INATIVO', createdAt: new Date(cc.created_at), updatedAt: new Date(cc.updated_at) } satisfies CostCenter;
    }),

  update: protectedProcedure
    .input(UpdateCostCenterSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...payload } = input;
      const { data: existing } = await ctx.supabase.from('cost_centers').select('id, name').eq('id', id).single();
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: CostCenterValidationMessages.COST_CENTER_NOT_FOUND });
      if (payload.name && payload.name !== (existing as { name: string }).name) {
        const { data: dup } = await ctx.supabase.from('cost_centers').select('id').eq('name', payload.name).single();
        if (dup && dup.id !== id) throw new TRPCError({ code: 'CONFLICT', message: CostCenterValidationMessages.NAME_ALREADY_EXISTS });
      }

      const { data, error } = await ctx.supabase
        .from('cost_centers')
        .update(payload)
        .eq('id', id)
        .select('id, name, status, created_at, updated_at')
        .single();
      if (error || !data) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao atualizar centro de custo' });
      const cc = data as SupabaseCostCenter;
      return { id: cc.id, name: cc.name, status: cc.status as 'ATIVO' | 'INATIVO', createdAt: new Date(cc.created_at), updatedAt: new Date(cc.updated_at) } satisfies CostCenter;
    }),

  delete: protectedProcedure
    .input(DeleteCostCenterSchema)
    .mutation(async ({ ctx, input }) => {
      // Verificar se há clientes vinculados
      const { data: linked } = await ctx.supabase
        .from('clients')
        .select('id')
        .eq('cost_center_id', input.id)
        .limit(1);
      if (linked && linked.length > 0) {
        throw new TRPCError({ code: 'CONFLICT', message: CostCenterValidationMessages.CANNOT_DELETE_WITH_CLIENTS });
      }

      const { error } = await ctx.supabase
        .from('cost_centers')
        .delete()
        .eq('id', input.id);
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao excluir centro de custo' });
      return { success: true };
    }),
});

 