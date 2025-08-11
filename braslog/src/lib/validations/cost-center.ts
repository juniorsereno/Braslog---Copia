import { z } from "zod";

export const CostCenterStatusEnum = z.enum(["ATIVO", "INATIVO"], {
  errorMap: () => ({ message: "Status deve ser ATIVO ou INATIVO" }),
});

export const CostCenterBaseSchema = z.object({
  name: z
    .string({ required_error: "Nome é obrigatório" })
    .min(1, "Nome não pode estar vazio")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim(),
  status: CostCenterStatusEnum.default("ATIVO"),
});

export const CreateCostCenterSchema = CostCenterBaseSchema;

export const UpdateCostCenterSchema = CostCenterBaseSchema.partial().extend({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

export const GetCostCenterByIdSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

export const ListCostCentersSchema = z.object({
  status: CostCenterStatusEnum.optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export const DeleteCostCenterSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

export type CostCenter = {
  id: string;
  name: string;
  status: z.infer<typeof CostCenterStatusEnum>;
  createdAt: Date;
  updatedAt: Date;
};

export const CostCenterValidationMessages = {
  NAME_ALREADY_EXISTS: "Já existe um centro de custo com este nome",
  COST_CENTER_NOT_FOUND: "Centro de custo não encontrado",
  CANNOT_DELETE_WITH_CLIENTS: "Não é possível excluir um Centro de Custo que possui clientes vinculados",
} as const;


