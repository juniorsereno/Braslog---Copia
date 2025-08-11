-- Habilita a extensão pg_trgm e cria índice otimizado para buscas ILIKE em clients.name
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_clients_name_trgm
  ON public.clients
  USING GIN (name gin_trgm_ops);



