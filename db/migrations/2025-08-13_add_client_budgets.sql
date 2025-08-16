-- Adiciona colunas de budget/metas por KPI na tabela clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS budget_receita numeric(12,2),
  ADD COLUMN IF NOT EXISTS budget_on_time numeric(5,2),
  ADD COLUMN IF NOT EXISTS budget_ocupacao numeric(5,2),
  ADD COLUMN IF NOT EXISTS budget_terceiro numeric(5,2),
  ADD COLUMN IF NOT EXISTS budget_disponibilidade numeric(5,2);


