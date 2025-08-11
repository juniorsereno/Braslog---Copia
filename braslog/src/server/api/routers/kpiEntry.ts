import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  CreateKpiEntrySchema,
  UpdateKpiEntrySchema,
  GetKpiEntryByIdSchema,
  GetKpiEntriesByDateSchema,
  GetKpiByMonthSchema,
  DeleteKpiEntrySchema,
  UpsertKpiEntriesSchema,
  ListKpiEntriesSchema,
  KpiValidationMessages,
  convertFormDataToEntries,
  convertEntriesToFormData,
  validateKpiValue,
  type KpiEntry,
  type KpiType,
} from "~/lib/validations/kpi";

// Helper function to convert Supabase data to KpiEntry
type SupabaseKpiRow = {
  id: string;
  date: string;
  client_id: string;
  kpi_type: string;
  kpi_value: string | number;
  created_at: string;
  updated_at: string;
  clients?: { id: string; name: string; status: string } | null;
};

function convertSupabaseToKpiEntry(entry: SupabaseKpiRow): KpiEntry {
  return {
    id: entry.id,
    date: new Date(entry.date),
    clientId: entry.client_id,
    kpiType: entry.kpi_type as KpiType,
    kpiValue: parseFloat(String(entry.kpi_value)),
    createdAt: new Date(entry.created_at),
    updatedAt: new Date(entry.updated_at),
    client: entry.clients ? {
      id: entry.clients.id,
      name: entry.clients.name,
      status: entry.clients.status,
    } : undefined,
  };
}

export const kpiEntryRouter = createTRPCRouter({
  /**
   * Buscar entradas de KPI por data
   */
  getByDate: protectedProcedure
    .input(GetKpiEntriesByDateSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { date, clientId, kpiType } = input;

        // Construir query usando Supabase client
        let query = ctx.supabase
          .from('kpi_entries')
          .select(`
            id,
            date,
            kpi_type,
            kpi_value,
            created_at,
            updated_at,
            client_id
          `)
          .eq('date', date);

        // Aplicar filtros opcionais
        if (clientId) {
          query = query.eq('client_id', clientId);
        }

        if (kpiType) {
          query = query.eq('kpi_type', kpiType);
        }

        // Ordenar por cliente e tipo de KPI
        query = query.order('client_id').order('kpi_type');

        const { data: entries, error } = await query;

        if (error) {
          console.error("Supabase error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar entradas de KPI",
          });
        }

        const typedEntries = (entries ?? []).map((entry: any) => ({
          id: entry.id,
          date: new Date(entry.date),
          clientId: entry.client_id,
          kpiType: entry.kpi_type as KpiType,
          kpiValue: parseFloat(entry.kpi_value),
          createdAt: new Date(entry.created_at),
          updatedAt: new Date(entry.updated_at),
        })) as KpiEntry[];

        return {
          entries: typedEntries,
          formData: convertEntriesToFormData(typedEntries, date),
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error("Error fetching KPI entries by date:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar entradas de KPI",
        });
      }
    }),

  /**
   * Buscar entrada de KPI por ID
   */
  getById: protectedProcedure
    .input(GetKpiEntryByIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { data: entry, error } = await ctx.supabase
          .from('kpi_entries')
          .select(`
            id,
            date,
            kpi_type,
            kpi_value,
            created_at,
            updated_at,
            client_id,
            clients (
              id,
              name,
              status
            )
          `)
          .eq('id', input.id)
          .single();

        if (error || !entry) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: KpiValidationMessages.ENTRY_NOT_FOUND,
          });
        }

        const typedEntry = entry as any;
        return {
          id: typedEntry.id,
          date: new Date(typedEntry.date),
          clientId: typedEntry.client_id,
          kpiType: typedEntry.kpi_type as KpiType,
          kpiValue: parseFloat(typedEntry.kpi_value),
          createdAt: new Date(typedEntry.created_at),
          updatedAt: new Date(typedEntry.updated_at),
          client: typedEntry.clients ? {
            id: typedEntry.clients.id,
            name: typedEntry.clients.name,
            status: typedEntry.clients.status,
          } : undefined,
        } as KpiEntry;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error("Error fetching KPI entry by ID:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar entrada de KPI",
        });
      }
    }),

  /**
   * Criar nova entrada de KPI
   */
  create: protectedProcedure
    .input(CreateKpiEntrySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Validar valor baseado no tipo de KPI
        validateKpiValue(input.kpiType, input.kpiValue);

        // Verificar se já existe uma entrada para esta combinação
        const { data: existingEntry } = await ctx.supabase
          .from('kpi_entries')
          .select('id')
          .eq('date', input.date)
          .eq('client_id', input.clientId)
          .eq('kpi_type', input.kpiType)
          .single();

        if (existingEntry) {
          throw new TRPCError({
            code: "CONFLICT",
            message: KpiValidationMessages.DUPLICATE_ENTRY,
          });
        }

        // Verificar se o cliente existe
        const { data: client } = await ctx.supabase
          .from('clients')
          .select('id, name, status')
          .eq('id', input.clientId)
          .single();

        if (!client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cliente não encontrado",
          });
        }

        // Criar a entrada
        const { data: entry, error } = await ctx.supabase
          .from('kpi_entries')
          .insert({
            date: input.date,
            client_id: input.clientId,
            kpi_type: input.kpiType,
            kpi_value: input.kpiValue.toString(),
          })
          .select(`
            id,
            date,
            kpi_type,
            kpi_value,
            created_at,
            updated_at,
            client_id
          `)
          .single();

        if (error || !entry) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar entrada de KPI",
          });
        }

        const typedEntry = entry as any;
        return {
          id: typedEntry.id,
          date: new Date(typedEntry.date),
          clientId: typedEntry.client_id,
          kpiType: typedEntry.kpi_type as KpiType,
          kpiValue: parseFloat(typedEntry.kpi_value),
          createdAt: new Date(typedEntry.created_at),
          updatedAt: new Date(typedEntry.updated_at),
          client: {
            id: client.id,
            name: client.name,
            status: client.status,
          },
        } as KpiEntry;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Error creating KPI entry:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar entrada de KPI",
        });
      }
    }),

  /**
   * Atualizar entrada de KPI existente
   */
  update: protectedProcedure
    .input(UpdateKpiEntrySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Verificar se a entrada existe
        const { data: existingEntry } = await ctx.supabase
          .from('kpi_entries')
          .select('id, date, client_id, kpi_type, kpi_value')
          .eq('id', id)
          .single();

        if (!existingEntry) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: KpiValidationMessages.ENTRY_NOT_FOUND,
          });
        }

        // Se está atualizando o valor, validar baseado no tipo
        if (updateData.kpiValue !== undefined) {
          const kpiType = (updateData.kpiType ?? existingEntry.kpi_type) as KpiType;
          validateKpiValue(kpiType, updateData.kpiValue);
        }

        // Se está mudando data, cliente ou tipo, verificar duplicatas
        if (updateData.date || updateData.clientId || updateData.kpiType) {
          const checkDate = updateData.date ?? existingEntry.date;
          const checkClientId = updateData.clientId ?? existingEntry.client_id;
          const checkKpiType = updateData.kpiType ?? existingEntry.kpi_type;

          const { data: duplicateEntry } = await ctx.supabase
            .from('kpi_entries')
            .select('id')
            .eq('date', checkDate)
            .eq('client_id', checkClientId)
            .eq('kpi_type', checkKpiType)
            .neq('id', id)
            .single();

          if (duplicateEntry) {
            throw new TRPCError({
              code: "CONFLICT",
              message: KpiValidationMessages.DUPLICATE_ENTRY,
            });
          }
        }

        // Preparar dados para atualização
        const updatePayload: Record<string, any> = {};
        if (updateData.date) updatePayload.date = updateData.date;
        if (updateData.clientId) updatePayload.client_id = updateData.clientId;
        if (updateData.kpiType) updatePayload.kpi_type = updateData.kpiType;
        if (updateData.kpiValue !== undefined) updatePayload.kpi_value = updateData.kpiValue.toString();

        // Atualizar a entrada
        const { data: updatedEntry, error } = await ctx.supabase
          .from('kpi_entries')
          .update(updatePayload)
          .eq('id', id)
          .select(`
            id,
            date,
            kpi_type,
            kpi_value,
            created_at,
            updated_at,
            client_id,
            clients (
              id,
              name,
              status
            )
          `)
          .single();

        if (error || !updatedEntry) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao atualizar entrada de KPI",
          });
        }

        const typedEntry = updatedEntry as any;
        return {
          id: typedEntry.id,
          date: new Date(typedEntry.date),
          clientId: typedEntry.client_id,
          kpiType: typedEntry.kpi_type as KpiType,
          kpiValue: parseFloat(typedEntry.kpi_value),
          createdAt: new Date(typedEntry.created_at),
          updatedAt: new Date(typedEntry.updated_at),
          client: typedEntry.clients ? {
            id: typedEntry.clients.id,
            name: typedEntry.clients.name,
            status: typedEntry.clients.status,
          } : undefined,
        } as KpiEntry;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Error updating KPI entry:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar entrada de KPI",
        });
      }
    }),

  /**
   * Excluir entrada de KPI
   */
  delete: protectedProcedure
    .input(DeleteKpiEntrySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verificar se a entrada existe
        const { data: existingEntry } = await ctx.supabase
          .from('kpi_entries')
          .select('id, date, kpi_type, clients(name)')
          .eq('id', input.id)
          .single();

        if (!existingEntry) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: KpiValidationMessages.ENTRY_NOT_FOUND,
          });
        }

        // Excluir a entrada
        const { error } = await ctx.supabase
          .from('kpi_entries')
          .delete()
          .eq('id', input.id);

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao excluir entrada de KPI",
          });
        }

        return { 
          success: true, 
          message: "Entrada de KPI excluída com sucesso",
          deletedEntry: {
            id: input.id,
            date: existingEntry.date,
            kpiType: existingEntry.kpi_type,
            clientName: (existingEntry as any).clients?.name,
          }
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Error deleting KPI entry:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao excluir entrada de KPI",
        });
      }
    }),

  /**
   * Upsert múltiplas entradas de KPI (operação principal do formulário)
   */
  upsertMany: protectedProcedure
    .input(UpsertKpiEntriesSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { date, entries } = input;
        
        // Converter dados do formulário para entradas individuais
        const kpiEntries = convertFormDataToEntries({ date, entries });
        
        if (kpiEntries.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: KpiValidationMessages.ENTRIES_REQUIRED,
          });
        }

        // Validar todos os valores antes de processar
        for (const entry of kpiEntries) {
          validateKpiValue(entry.kpiType, entry.kpiValue);
        }

        // Verificar se todos os clientes existem
        const clientIds = [...new Set(kpiEntries.map(e => e.clientId))];
        const { data: clients, error: clientsError } = await ctx.supabase
          .from('clients')
          .select('id, name, status')
          .in('id', clientIds);

        if (clientsError || !clients || clients.length !== clientIds.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Um ou mais clientes não foram encontrados",
          });
        }

        // Buscar entradas existentes para esta data
        const { data: existingEntries } = await ctx.supabase
          .from('kpi_entries')
          .select('id, client_id, kpi_type, kpi_value')
          .eq('date', date)
          .in('client_id', clientIds);

        const existingMap = new Map<string, { id: string; value: number }>();
        (existingEntries ?? []).forEach(entry => {
          const key = `${entry.client_id}-${entry.kpi_type}`;
          existingMap.set(key, { 
            id: entry.id, 
            value: parseFloat(entry.kpi_value) 
          });
        });

        const toInsert: any[] = [];
        const toUpdate: any[] = [];
        const toDelete: string[] = [];

        // Processar cada entrada
        for (const entry of kpiEntries) {
          const key = `${entry.clientId}-${entry.kpiType}`;
          const existing = existingMap.get(key);

          if (existing) {
            // Se o valor mudou, atualizar
            if (existing.value !== entry.kpiValue) {
              toUpdate.push({
                id: existing.id,
                kpi_value: entry.kpiValue.toString(),
              });
            }
            existingMap.delete(key); // Marcar como processado
          } else {
            // Nova entrada
            toInsert.push({
              date: entry.date,
              client_id: entry.clientId,
              kpi_type: entry.kpiType,
              kpi_value: entry.kpiValue.toString(),
            });
          }
        }

        // Entradas que sobraram no mapa devem ser excluídas (não estão no formulário)
        for (const [, existing] of existingMap) {
          toDelete.push(existing.id);
        }

        // Inserções
        if (toInsert.length > 0) {
          const { error: insError } = await ctx.supabase
            .from('kpi_entries')
            .insert(toInsert);
          if (insError) {
            console.error("Insert error:", insError);
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao salvar dados de KPI' });
          }
        }

        // Atualizações
        for (const update of toUpdate) {
          const { error: updError } = await ctx.supabase
            .from('kpi_entries')
            .update({ kpi_value: update.kpi_value })
            .eq('id', update.id);
          if (updError) {
            console.error("Update error:", updError);
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao salvar dados de KPI' });
          }
        }

        // Exclusões
        if (toDelete.length > 0) {
          const { error: delError } = await ctx.supabase
            .from('kpi_entries')
            .delete()
            .in('id', toDelete);
          if (delError) {
            console.error("Delete error:", delError);
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao salvar dados de KPI' });
          }
        }

        // Buscar dados atualizados para retornar
        const { data: updatedEntries, error: fetchError } = await ctx.supabase
          .from('kpi_entries')
          .select(`
            id,
            date,
            kpi_type,
            kpi_value,
            created_at,
            updated_at,
            client_id
          `)
          .eq('date', date)
          .in('client_id', clientIds)
          .order('client_id')
          .order('kpi_type');

        if (fetchError) {
          console.error("Error fetching updated entries:", fetchError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar dados atualizados",
          });
        }

        const typedEntries = (updatedEntries ?? []).map((entry: any) => ({
          id: entry.id,
          date: new Date(entry.date),
          clientId: entry.client_id,
          kpiType: entry.kpi_type as KpiType,
          kpiValue: parseFloat(entry.kpi_value),
          createdAt: new Date(entry.created_at),
          updatedAt: new Date(entry.updated_at),
        })) as KpiEntry[];

        return {
          success: true,
          message: "Dados de KPI salvos com sucesso",
          entries: typedEntries,
          formData: convertEntriesToFormData(typedEntries, date),
          stats: {
            inserted: toInsert.length,
            updated: toUpdate.length,
            deleted: toDelete.length,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Error upserting KPI entries:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao salvar dados de KPI",
        });
      }
    }),

  /**
   * Listar entradas de KPI com filtros e paginação
   */
  list: protectedProcedure
    .input(ListKpiEntriesSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { startDate, endDate, clientId, kpiType, limit, offset } = input;

        // Construir query usando Supabase client
        let query = ctx.supabase
          .from('kpi_entries')
          .select(`
            id,
            date,
            kpi_type,
            kpi_value,
            created_at,
            updated_at,
            client_id,
            clients (
              id,
              name,
              status
            )
          `, { count: 'exact' });

        // Aplicar filtros
        if (startDate) {
          query = query.gte('date', startDate);
        }

        if (endDate) {
          query = query.lte('date', endDate);
        }

        if (clientId) {
          query = query.eq('client_id', clientId);
        }

        if (kpiType) {
          query = query.eq('kpi_type', kpiType);
        }

        // Aplicar ordenação e paginação
        query = query
          .order('date', { ascending: false })
          .order('client_id')
          .order('kpi_type')
          .range(offset, offset + limit - 1);

        const { data: entries, count: totalCount, error } = await query;

        if (error) {
          console.error("Supabase error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar entradas de KPI",
          });
        }

        const typedEntries = (entries ?? []).map((entry: any) => ({
          id: entry.id,
          date: new Date(entry.date),
          clientId: entry.client_id,
          kpiType: entry.kpi_type as KpiType,
          kpiValue: parseFloat(entry.kpi_value),
          createdAt: new Date(entry.created_at),
          updatedAt: new Date(entry.updated_at),
          client: entry.clients ? {
            id: entry.clients.id,
            name: entry.clients.name,
            status: entry.clients.status,
          } : undefined,
        })) as KpiEntry[];

        return {
          entries: typedEntries,
          totalCount: totalCount ?? 0,
          hasMore: offset + limit < (totalCount ?? 0),
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error("Error listing KPI entries:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao listar entradas de KPI",
        });
      }
    }),

  /**
   * Obter estatísticas das entradas de KPI
   */
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        // Buscar estatísticas básicas
        const utcNow = new Date();
        const todayIso = new Date(Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth(), utcNow.getUTCDate())).toISOString().split('T')[0];
        const weekAgoIso = new Date(Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth(), utcNow.getUTCDate() - 7)).toISOString().split('T')[0];
        const monthStartIso = new Date(Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth(), 1)).toISOString().split('T')[0];

        const totalPromise = ctx.supabase.from('kpi_entries').select('id', { count: 'exact', head: true });
        const todayPromise = ctx.supabase.from('kpi_entries').select('id', { count: 'exact', head: true }).eq('date', todayIso);
        const weekPromise = ctx.supabase.from('kpi_entries').select('id', { count: 'exact', head: true }).gte('date', weekAgoIso);
        const monthPromise = ctx.supabase.from('kpi_entries').select('id', { count: 'exact', head: true }).gte('date', monthStartIso);
        const [totalResult, todayResult, thisWeekResult, thisMonthResult] = await Promise.all([
          totalPromise, todayPromise, weekPromise, monthPromise,
        ]);

        // Buscar estatísticas por tipo de KPI
        const { data: kpiTypeStats } = await ctx.supabase
          .from('kpi_entries')
          .select('kpi_type', { count: 'exact' })
          .order('kpi_type');

        const kpiTypeCounts = (kpiTypeStats ?? []).reduce((acc: Record<string, number>, item: any) => {
          acc[item.kpi_type] = (acc[item.kpi_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          total: totalResult.count ?? 0,
          today: todayResult.count ?? 0,
          thisWeek: thisWeekResult.count ?? 0,
          thisMonth: thisMonthResult.count ?? 0,
          byKpiType: kpiTypeCounts,
        };
      } catch (error) {
        console.error("Error fetching KPI entry stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar estatísticas das entradas de KPI",
        });
      }
    }),

  /**
   * Buscar todas as entradas de um mês (YYYY-MM) com opcional filtro por cliente
   */
  getByMonth: protectedProcedure
    .input(GetKpiByMonthSchema)
    .query(async ({ ctx, input }) => {
      const { month, clientId } = input;
      const start = `${month}-01`;
      // calcular último dia real do mês para evitar datas inválidas (ex: 2025-06-31)
      const [yStr, mStr] = month.split("-");
      const y = Number(yStr);
      const m = Number(mStr); // 1..12
      const lastDay = new Date(y, m, 0).getDate();
      const end = `${month}-${String(lastDay).padStart(2, "0")}`;

      let query = ctx.supabase
        .from('kpi_entries')
        .select(`
          id,
          date,
          kpi_type,
          kpi_value,
          created_at,
          updated_at,
          client_id,
          clients (
            id,
            name,
            status
          )
        `)
        .gte('date', start)
        .lte('date', end);

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data: entries, error } = await query;
      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao buscar entradas do mês' });
      }

      const typedEntries = (entries ?? []).map((entry: any) => ({
        id: entry.id,
        date: new Date(entry.date),
        clientId: entry.client_id,
        kpiType: entry.kpi_type as KpiType,
        kpiValue: parseFloat(entry.kpi_value),
        createdAt: new Date(entry.created_at),
        updatedAt: new Date(entry.updated_at),
        client: entry.clients ? {
          id: entry.clients.id,
          name: entry.clients.name,
          status: entry.clients.status,
        } : undefined,
      })) as KpiEntry[];

      return { entries: typedEntries };
    }),
});