"use client";

import { useMemo, useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

type KpiKey = "RECEITA" | "ON_TIME" | "OCUPACAO" | "TERCEIRO" | "DISPONIBILIDADE";

const KPI_TITLES: Record<KpiKey, string> = {
  RECEITA: "Receita",
  ON_TIME: "On Time",
  OCUPACAO: "Ocupação",
  TERCEIRO: "Terceiro",
  DISPONIBILIDADE: "Disponibilidade",
};

export function KpiPivotHistory() {
  // Filtro de mês e cliente
  const today = new Date();
  const initialMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState<string>(initialMonth);
  const [clientId, setClientId] = useState<string | undefined>(undefined);

  // Buscar dados do mês
  const { data, isFetching } = api.kpiEntry.getByMonth.useQuery({ month, clientId: clientId ?? undefined });
  const entries = data?.entries ?? [];

  // Buscar clientes para linhas (sempre todos para mostrar '-')
  const { data: clientsResp } = api.client.getAll.useQuery({ limit: 100, offset: 0 });
  const clients = (clientsResp?.clients ?? []).sort((a, b) => a.name.localeCompare(b.name));

  // Extrair todos os dias do mês para colunas (1..N)
  const daysInMonth = useMemo(() => {
    const parts = month.split('-');
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return Array.from({ length: last }, (_, i) => i + 1);
  }, [month]);

  // Mapear (kpiType -> clientId -> day -> value)
  const kpiMap = useMemo(() => {
    const map: Partial<Record<KpiKey, Record<string, Record<number, number>>>> = {};
    for (const e of entries) {
      const key = e.kpiType as KpiKey;
      const d = new Date(e.date);
      const day = d.getUTCDate();
      if (!map[key]) {
        map[key] = {} as Record<string, Record<number, number>>;
      }
      const byClientCandidate = map[key];
      if (!byClientCandidate) {
        continue;
      }
      const byClient: Record<string, Record<number, number>> = byClientCandidate as Record<string, Record<number, number>>;
      const currentRow = byClient[e.clientId] ?? {};
      currentRow[day] = e.kpiValue;
      byClient[e.clientId] = currentRow;
    }
    return map as Record<KpiKey, Record<string, Record<number, number>>>;
  }, [entries]);

  const monthLabel = useMemo(() => {
    const safe = typeof month === 'string' ? month : '';
    const parts = safe.split('-');
    const y = parts[0] ?? '';
    const m = parts[1] ?? '';
    return `${m}/${y}`;
  }, [month]);

  const changeMonth = (delta: number) => {
    const parts = month.split('-');
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const date = new Date(y, m - 1 + delta, 1);
    const next = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setMonth(next);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-2">
              <Label>Mês</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => changeMonth(-1)}>{"<"}</Button>
                <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                <Button variant="outline" onClick={() => changeMonth(1)}>{">"}</Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 min-w-64">
              <Label>Cliente</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={clientId ?? "__ALL__"}
                  onValueChange={(v) => setClientId(v === "__ALL__" ? undefined : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__ALL__">Todos</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {clientId && (
                  <Button variant="outline" size="sm" onClick={() => setClientId(undefined)}>Limpar</Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isFetching && (
        <Card>
          <CardContent className="pt-6">Carregando dados...</CardContent>
        </Card>
      )}

      {!isFetching && entries.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-muted-foreground">Nenhum lançamento encontrado para {monthLabel}.</CardContent>
        </Card>
      )}

      {(Object.keys(KPI_TITLES) as KpiKey[]).map((kpi) => (
        <Card key={kpi}>
          <CardContent className="pt-6">
            <div className="mb-2 font-semibold">{KPI_TITLES[kpi]} — {monthLabel}</div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-56 sticky left-0 z-20 bg-background">Cliente</TableHead>
                      {daysInMonth.map((d) => (
                      <TableHead key={d} className="text-center sticky top-0 bg-background z-10">{d}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium whitespace-nowrap sticky left-0 bg-background z-10">{c.name}</TableCell>
                      {daysInMonth.map((d) => {
                        const row = kpiMap[kpi]?.[c.id];
                        const v = row ? row[d] : undefined;
                        return (
                          <TableCell key={d} className="text-center">
                            {v === undefined
                              ? "-"
                              : kpi === "RECEITA"
                              ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
                              : `${Number(v).toFixed(1)}%`}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


