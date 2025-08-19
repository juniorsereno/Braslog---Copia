import { z } from "zod";

/**
 * Enum para tipos de KPI
 */
export const KpiTypeEnum = z.enum([
  "RECEITA",
  "ON_TIME", 
  "OCUPACAO",
  "TERCEIRO",
  "DISPONIBILIDADE"
], {
  errorMap: () => ({ message: "Tipo de KPI inválido" }),
});

/**
 * Schema para validação de valor de receita (monetário em BRL)
 */
export const ReceitaValueSchema = z
  .number({
    required_error: "Valor da receita é obrigatório",
    invalid_type_error: "Receita deve ser um número",
  })
  .min(0, "Receita deve ser um valor positivo")
  .max(999999999.99, "Valor da receita muito alto")
  .refine(
    (value) => Number.isFinite(value),
    "Receita deve ser um número válido"
  );

/**
 * Schema para validação de valores percentuais (0-100)
 */
export const PercentualValueSchema = z
  .number({
    required_error: "Valor percentual é obrigatório",
    invalid_type_error: "Percentual deve ser um número",
  })
  .min(0, "Percentual deve ser entre 0 e 100")
  .max(100, "Percentual deve ser entre 0 e 100")
  .refine(
    (value) => Number.isFinite(value),
    "Percentual deve ser um número válido"
  );

/**
 * Schema para validação de valor de KPI baseado no tipo
 */
export const KpiValueSchema = z
  .number()
  .refine((value) => {
    // Esta validação será refinada no contexto do tipo de KPI
    return Number.isFinite(value) && value >= 0;
  }, "Valor de KPI inválido");

/**
 * Schema para validação de data no formato YYYY-MM-DD
 */
export const KpiDateSchema = z
  .string({
    required_error: "Data é obrigatória",
    invalid_type_error: "Data deve ser uma string",
  })
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Data deve estar no formato YYYY-MM-DD"
  )
  .refine(
    (dateStr) => {
      const date = new Date(dateStr);
      return !isNaN(date.getTime()) && dateStr === date.toISOString().split('T')[0];
    },
    "Data deve ser uma data válida"
  );

/**
 * Schema base para entrada de KPI
 */
export const KpiEntryBaseSchema = z.object({
  date: KpiDateSchema,
  clientId: z.string().uuid("ID do cliente deve ser um UUID válido"),
  kpiType: KpiTypeEnum,
  kpiValue: z.number().min(0, "Valor deve ser positivo"),
});

/**
 * Schema para criação de entrada de KPI individual
 */
export const CreateKpiEntrySchema = KpiEntryBaseSchema.refine(
  (data) => {
    // Validação específica baseada no tipo de KPI
    if (data.kpiType === "RECEITA") {
      return ReceitaValueSchema.safeParse(data.kpiValue).success;
    } else {
      return PercentualValueSchema.safeParse(data.kpiValue).success;
    }
  },
  {
    message: "Valor inválido para o tipo de KPI especificado",
    path: ["kpiValue"],
  }
);

/**
 * Schema para atualização de entrada de KPI
 */
export const UpdateKpiEntrySchema = KpiEntryBaseSchema.partial().extend({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

/**
 * Schema para busca de entrada de KPI por ID
 */
export const GetKpiEntryByIdSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

/**
 * Schema para busca de entradas de KPI por data
 */
export const GetKpiEntriesByDateSchema = z.object({
  date: KpiDateSchema,
  clientId: z.string().uuid().optional(),
  kpiType: KpiTypeEnum.optional(),
});

/**
 * Schema para exclusão de entrada de KPI
 */
export const DeleteKpiEntrySchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

/**
 * Schema para entrada de dados de KPI em lote (formulário principal)
 */
export const KpiFormEntrySchema = z.object({
  clientId: z.string().uuid("ID do cliente deve ser um UUID válido"),
  receita: z.number().min(0).optional(),
  onTime: z.number().min(0).max(100).optional(),
  ocupacao: z.number().min(0).max(100).optional(),
  terceiro: z.number().min(0).max(100).optional(),
  disponibilidade: z.number().min(0).max(100).optional(),
});

/**
 * Schema para salvamento em lote de KPIs
 */
export const UpsertKpiEntriesSchema = z.object({
  date: KpiDateSchema,
  entries: z.array(KpiFormEntrySchema).min(1, "Pelo menos uma entrada é obrigatória"),
});

/**
 * Schema para filtros de listagem de entradas de KPI
 */
export const ListKpiEntriesSchema = z.object({
  startDate: KpiDateSchema.optional(),
  endDate: KpiDateSchema.optional(),
  clientId: z.string().uuid().optional(),
  kpiType: KpiTypeEnum.optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

/**
 * Schema para busca de entradas de KPI por mês (YYYY-MM)
 */
export const GetKpiByMonthSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/i, "Mês deve estar no formato YYYY-MM"),
  clientId: z
    .union([z.string().uuid(), z.null()])
    .optional()
    .transform((v) => v ?? undefined),
});

/**
 * Tipos TypeScript derivados dos schemas Zod
 */
export type KpiType = z.infer<typeof KpiTypeEnum>;
export type KpiEntryBase = z.infer<typeof KpiEntryBaseSchema>;
export type CreateKpiEntry = z.infer<typeof CreateKpiEntrySchema>;
export type UpdateKpiEntry = z.infer<typeof UpdateKpiEntrySchema>;
export type GetKpiEntryById = z.infer<typeof GetKpiEntryByIdSchema>;
export type GetKpiEntriesByDate = z.infer<typeof GetKpiEntriesByDateSchema>;
export type DeleteKpiEntry = z.infer<typeof DeleteKpiEntrySchema>;
export type KpiFormEntry = z.infer<typeof KpiFormEntrySchema>;
export type UpsertKpiEntries = z.infer<typeof UpsertKpiEntriesSchema>;
export type ListKpiEntries = z.infer<typeof ListKpiEntriesSchema>;
export type GetKpiByMonth = z.infer<typeof GetKpiByMonthSchema>;

/**
 * Schema para resumo do dashboard (cards superiores)
 */
export const GetDashboardSummarySchema = z.object({
  date: KpiDateSchema,
  clientIds: z.array(z.string().uuid()).optional(),
  costCenterIds: z.array(z.string().uuid()).optional(),
});

export type GetDashboardSummary = z.infer<typeof GetDashboardSummarySchema>;

/**
 * Tipo para entrada de KPI completa (incluindo campos do banco)
 */
export type KpiEntry = {
  id: string;
  date: Date;
  clientId: string;
  kpiType: KpiType;
  kpiValue: number;
  createdAt: Date;
  updatedAt: Date;
  client?: {
    id: string;
    name: string;
    status: string;
  };
};

/**
 * Tipo para dados do formulário de KPI (estrutura da tabela principal)
 */
export type KpiFormData = {
  date: string;
  entries: {
    clientId: string;
    receita?: number;
    onTime?: number;
    ocupacao?: number;
    terceiro?: number;
    disponibilidade?: number;
  }[];
};

/**
 * Mensagens de erro personalizadas para validação
 */
export const KpiValidationMessages = {
  DATE_REQUIRED: "Data é obrigatória",
  DATE_INVALID_FORMAT: "Data deve estar no formato YYYY-MM-DD",
  DATE_INVALID: "Data deve ser uma data válida",
  CLIENT_ID_REQUIRED: "ID do cliente é obrigatório",
  CLIENT_ID_INVALID: "ID do cliente deve ser um UUID válido",
  KPI_TYPE_INVALID: "Tipo de KPI inválido",
  KPI_VALUE_REQUIRED: "Valor do KPI é obrigatório",
  KPI_VALUE_INVALID: "Valor do KPI deve ser um número válido",
  RECEITA_MIN: "Receita deve ser um valor positivo",
  RECEITA_MAX: "Valor da receita muito alto",
  PERCENTUAL_MIN: "Percentual deve ser entre 0 e 100",
  PERCENTUAL_MAX: "Percentual deve ser entre 0 e 100",
  ENTRY_NOT_FOUND: "Entrada de KPI não encontrada",
  DUPLICATE_ENTRY: "Já existe uma entrada para este cliente, data e tipo de KPI",
  ENTRIES_REQUIRED: "Pelo menos uma entrada é obrigatória",
} as const;

/**
 * Função utilitária para validar valor de KPI baseado no tipo
 */
export const validateKpiValue = (kpiType: KpiType, value: number): number => {
  if (kpiType === "RECEITA") {
    const result = ReceitaValueSchema.safeParse(value);
    if (!result.success) {
      throw new Error(result.error.errors[0]?.message ?? "Valor de receita inválido");
    }
    return result.data;
  } else {
    const result = PercentualValueSchema.safeParse(value);
    if (!result.success) {
      throw new Error(result.error.errors[0]?.message ?? "Valor percentual inválido");
    }
    return result.data;
  }
};

/**
 * Função utilitária para validar data
 */
export const validateKpiDate = (date: string): string => {
  const result = KpiDateSchema.safeParse(date);
  if (!result.success) {
    throw new Error(result.error.errors[0]?.message ?? "Data inválida");
  }
  return result.data;
};

/**
 * Função utilitária para converter dados do formulário em entradas individuais
 */
export const convertFormDataToEntries = (formData: KpiFormData): CreateKpiEntry[] => {
  const entries: CreateKpiEntry[] = [];
  
  for (const entry of formData.entries) {
    const kpiTypes: Array<{ type: KpiType; value?: number }> = [
      { type: "RECEITA", value: entry.receita },
      { type: "ON_TIME", value: entry.onTime },
      { type: "OCUPACAO", value: entry.ocupacao },
      { type: "TERCEIRO", value: entry.terceiro },
      { type: "DISPONIBILIDADE", value: entry.disponibilidade },
    ];

    for (const kpi of kpiTypes) {
      if (kpi.value !== undefined && kpi.value !== null) {
        entries.push({
          date: formData.date,
          clientId: entry.clientId,
          kpiType: kpi.type,
          kpiValue: kpi.value,
        });
      }
    }
  }

  return entries;
};

/**
 * Função utilitária para converter entradas do banco em dados do formulário
 */
export const convertEntriesToFormData = (entries: KpiEntry[], date: string): KpiFormData => {
  // Agrupar entradas por cliente
  const entriesByClient = entries.reduce((acc, entry) => {
    acc[entry.clientId] ??= { clientId: entry.clientId } as KpiFormEntry;

    // Mapear tipos de KPI para campos do formulário
    const clientEntry = acc[entry.clientId]!;
    switch (entry.kpiType) {
      case "RECEITA":
        clientEntry.receita = entry.kpiValue; break;
      case "ON_TIME":
        clientEntry.onTime = entry.kpiValue; break;
      case "OCUPACAO":
        clientEntry.ocupacao = entry.kpiValue; break;
      case "TERCEIRO":
        clientEntry.terceiro = entry.kpiValue; break;
      case "DISPONIBILIDADE":
        clientEntry.disponibilidade = entry.kpiValue; break;
    }

    return acc;
  }, {} as Record<string, KpiFormEntry>);

  return {
    date,
    entries: Object.values(entriesByClient),
  };
};