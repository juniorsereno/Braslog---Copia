import { z } from "zod";

/**
 * Enum para status do cliente
 */
export const ClientStatusEnum = z.enum(["ATIVO", "INATIVO"], {
  errorMap: () => ({ message: "Status deve ser ATIVO ou INATIVO" }),
});

/**
 * Schema base para dados do cliente
 */
export const ClientBaseSchema = z.object({
  name: z
    .string({
      required_error: "Nome é obrigatório",
      invalid_type_error: "Nome deve ser um texto",
    })
    .min(1, "Nome não pode estar vazio")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .trim()
    .refine(
      (name) => name.length > 0,
      "Nome não pode conter apenas espaços em branco"
    ),
  status: ClientStatusEnum.default("ATIVO"),
  costCenterId: z.string().uuid().optional().nullable(),
  isKeyAccount: z.boolean().default(false),
});

/**
 * Schema para criação de cliente
 */
export const CreateClientSchema = ClientBaseSchema;

/**
 * Schema para atualização de cliente
 */
export const UpdateClientSchema = ClientBaseSchema.partial().extend({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

/**
 * Schema para busca de cliente por ID
 */
export const GetClientByIdSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

/**
 * Schema para filtros de listagem de clientes
 */
export const ListClientsSchema = z.object({
  status: ClientStatusEnum.optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

/**
 * Schema para exclusão de cliente
 */
export const DeleteClientSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

/**
 * Schema para validação de nome único
 */
export const ValidateUniqueNameSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  excludeId: z.string().uuid().optional(),
});

/**
 * Tipos TypeScript derivados dos schemas Zod
 */
export type ClientStatus = z.infer<typeof ClientStatusEnum>;
export type ClientBase = z.infer<typeof ClientBaseSchema>;
export type CreateClient = z.infer<typeof CreateClientSchema>;
export type UpdateClient = z.infer<typeof UpdateClientSchema>;
export type GetClientById = z.infer<typeof GetClientByIdSchema>;
export type ListClients = z.infer<typeof ListClientsSchema>;
export type DeleteClient = z.infer<typeof DeleteClientSchema>;
export type ValidateUniqueName = z.infer<typeof ValidateUniqueNameSchema>;

/**
 * Tipo para cliente completo (incluindo campos do banco)
 */
export type Client = {
  id: string;
  name: string;
  status: ClientStatus;
  costCenterId?: string | null;
  isKeyAccount: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Mensagens de erro personalizadas para validação
 */
export const ClientValidationMessages = {
  NAME_REQUIRED: "Nome do cliente é obrigatório",
  NAME_TOO_LONG: "Nome deve ter no máximo 100 caracteres",
  NAME_EMPTY: "Nome não pode estar vazio",
  NAME_WHITESPACE: "Nome não pode conter apenas espaços em branco",
  NAME_ALREADY_EXISTS: "Já existe um cliente com este nome",
  STATUS_INVALID: "Status deve ser ATIVO ou INATIVO",
  ID_INVALID: "ID deve ser um UUID válido",
  CLIENT_NOT_FOUND: "Cliente não encontrado",
} as const;

/**
 * Função utilitária para validar nome único
 */
export const validateClientName = (name: string): string => {
  const result = ClientBaseSchema.shape.name.safeParse(name);
  if (!result.success) {
    throw new Error(result.error.errors[0]?.message ?? "Nome inválido");
  }
  return result.data;
};

/**
 * Função utilitária para validar status
 */
export const validateClientStatus = (status: string): ClientStatus => {
  const result = ClientStatusEnum.safeParse(status);
  if (!result.success) {
    throw new Error(ClientValidationMessages.STATUS_INVALID);
  }
  return result.data;
};