"use client";

import { useMemo, useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "~/components/ui/table";
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
  const { data, isFetching } = api.kpiEntry.getByMonth.useQuery({ month, clientId: clientId ?? undefined }, {
    placeholderData: (prev) => prev,
  });
  const entries = useMemo(() => data?.entries ?? [], [data?.entries]);

  // Mês anterior (para linha "Prior Month")
  const prevMonth = useMemo(() => {
    const parts = month.split('-');
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = new Date(y, m - 2, 1); // m-1 é atual (1-based), então m-2 dá mês anterior
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, [month]);
  const { data: prevData } = api.kpiEntry.getByMonth.useQuery({ month: prevMonth, clientId: clientId ?? undefined }, {
    placeholderData: (prev) => prev,
  });
  const prevEntries = useMemo(() => prevData?.entries ?? [], [prevData?.entries]);

  // Buscar clientes para linhas (sempre todos para mostrar '-')
  const { data: clientsResp, error: clientsError } = api.client.getAll.useQuery({ limit: 100, offset: 0 }, { refetchOnWindowFocus: false });
  const clients = (clientsResp?.clients ?? []).sort((a, b) => a.name.localeCompare(b.name));
  const { data: costCentersResp, error: costCentersError } = api.costCenter.getAll.useQuery({ limit: 100, offset: 0 }, { refetchOnWindowFocus: false });
  const costCenters = (costCentersResp?.costCenters ?? []).sort((a, b) => a.name.localeCompare(b.name));

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
    const map: Record<KpiKey, Record<string, Record<number, number>>> = {
      RECEITA: {}, ON_TIME: {}, OCUPACAO: {}, TERCEIRO: {}, DISPONIBILIDADE: {}
    };
    for (const e of entries) {
      const key = e.kpiType as KpiKey;
      const d = new Date(e.date);
      const day = d.getUTCDate();
      const byClient = map[key];
      const currentRow = byClient[e.clientId] ?? {};
      currentRow[day] = e.kpiValue;
      byClient[e.clientId] = currentRow;
    }
    return map;
  }, [entries]);

  // Mapa do mês anterior (kpiType -> clientId -> day -> value)
  const prevKpiMap = useMemo(() => {
    const map: Record<KpiKey, Record<string, Record<number, number>>> = {
      RECEITA: {}, ON_TIME: {}, OCUPACAO: {}, TERCEIRO: {}, DISPONIBILIDADE: {}
    };
    for (const e of prevEntries) {
      const key = e.kpiType as KpiKey;
      const d = new Date(e.date);
      const day = d.getUTCDate();
      const byClient = map[key];
      const currentRow = byClient[e.clientId] ?? {};
      currentRow[day] = e.kpiValue;
      byClient[e.clientId] = currentRow;
    }
    return map;
  }, [prevEntries]);

  const integerFormatter = useMemo(() => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0, minimumFractionDigits: 0 }), []);

  const monthLabel = useMemo(() => {
    const safe = typeof month === 'string' ? month : '';
    const parts = safe.split('-');
    const y = parts[0] ?? '';
    const m = parts[1] ?? '';
    return `${m}/${y}`;
  }, [month]);

  // Limite de dias a mostrar para "Prior Month" quando o mês selecionado é o mês corrente
  const maxDayToShow = useMemo(() => {
    const now = new Date();
    const nowMonth = now.getMonth() + 1; // 1..12
    const nowYear = now.getFullYear();
    const [selYearStr, selMonthStr] = month.split('-');
    const selYear = Number(selYearStr);
    const selMonth = Number(selMonthStr);
    if (selYear === nowYear && selMonth === nowMonth) {
      return now.getDate();
    }
    return daysInMonth.length;
  }, [month, daysInMonth.length]);

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
        <CardContent className="py-2">
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <Label className="text-xs">Mês</Label>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={() => changeMonth(-1)}>{"<"}</Button>
                <Input className="h-8" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                <Button variant="outline" size="sm" onClick={() => changeMonth(1)}>{">"}</Button>
              </div>
            </div>

            <div className="flex flex-col gap-1 min-w-64">
              <Label className="text-xs">Cliente</Label>
              <div className="flex items-center gap-1.5">
                <Select
                  value={clientId ?? "__ALL__"}
                  onValueChange={(v) => setClientId(v === "__ALL__" ? undefined : v)}
                >
                  <SelectTrigger className="h-8">
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
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
              <div className="h-40 w-full bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      )}

      {(clientsError ?? costCentersError) ? (
        <Card>
          <CardContent className="pt-6 text-destructive">Erro ao carregar dados de apoio. Atualize a página e tente novamente.</CardContent>
        </Card>
      ) : null}

      {!isFetching && entries.length === 0 && !clientsError && !costCentersError && (
        <Card>
          <CardContent className="pt-6 text-muted-foreground">Nenhum lançamento encontrado para {monthLabel}.</CardContent>
        </Card>
      )}

      {(Object.keys(KPI_TITLES) as KpiKey[]).map((kpi) => (
        <Card key={kpi}>
          <CardContent className="pt-6">
            <div className="mb-2 font-semibold">{KPI_TITLES[kpi]} — {monthLabel}</div>
            <div className="relative w-full max-w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-40 bg-background">Centro/Cliente</TableHead>
                    {daysInMonth.map((d) => (
                      <TableHead key={d} className="text-center bg-background">{d}</TableHead>
                    ))}
                    <TableHead className="text-center bg-background z-10 w-16 text-xs">Total</TableHead>
                    <TableHead className="text-center bg-background z-10 w-16 text-xs">Meta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    // Helpers para agregação
                    const getValuesFor = (clientIds: string[], day: number): number[] => {
                      const values: number[] = [];
                      for (const clientId of clientIds) {
                        const row = kpiMap[kpi]?.[clientId];
                        const v = row ? row[day] : undefined;
                        if (typeof v === 'number') values.push(v);
                      }
                      return values;
                    };
                    const renderValueCell = (vals: number[]) => {
                      if (vals.length === 0) return "-";
                      if (kpi === 'RECEITA') {
                        const sum = vals.reduce((a, b) => a + b, 0);
                        return integerFormatter.format(sum);
                      }
                      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                      return `${Math.round(avg)}%`;
                    };
                    
                    // Meta diária (linha horizontal)
                    const relevantClients = clientId ? clients.filter((c) => c.id === clientId) : clients;
                    const numDays = daysInMonth.length;
                    const metaRow = (() => {
                      if (kpi === 'RECEITA') {
                        const monthlyMeta = relevantClients.reduce((acc, c) => acc + (c.budgetReceita ?? 0), 0);
                        const daily = numDays > 0 ? monthlyMeta / numDays : 0;
                        return {
                          label: 'Meta diária',
                          byDay: daysInMonth.map(() => (daily > 0 ? integerFormatter.format(daily) : '-')),
                          total: monthlyMeta > 0 ? integerFormatter.format(monthlyMeta) : '-',
                          meta: monthlyMeta > 0 ? integerFormatter.format(monthlyMeta) : '-',
                        };
                      }
                      const pick = (c: typeof clients[number]) => (
                        kpi === 'ON_TIME' ? c.budgetOnTime :
                        kpi === 'OCUPACAO' ? c.budgetOcupacao :
                        kpi === 'TERCEIRO' ? c.budgetTerceiro :
                        c.budgetDisponibilidade
                      );
                      const vals = relevantClients.map(pick).filter((v): v is number => typeof v === 'number');
                      const avg = vals.length ? (vals.reduce((a,b)=>a+b,0) / vals.length) : undefined;
                      const avgStr = avg == null ? '-' : `${Math.round(avg)}%`;
                      return {
                        label: 'Meta diária',
                        byDay: daysInMonth.map(() => avgStr),
                        total: avgStr,
                        meta: avgStr,
                      };
                    })();
                    const renderTotalCell = (valsByDay: number[][]) => {
                      const flat = valsByDay.flat();
                      if (flat.length === 0) return <TableCell className="text-center bg-background w-16 text-xs">-</TableCell>;
                      if (kpi === 'RECEITA') {
                        const total = flat.reduce((a, b) => a + b, 0);
                        return <TableCell className="text-center font-semibold bg-background w-16 text-xs">{integerFormatter.format(total)}</TableCell>;
                      }
                      const avg = flat.reduce((a, b) => a + b, 0) / flat.length;
                      return <TableCell className="text-center font-semibold bg-background w-16 text-xs">{`${Math.round(avg)}%`}</TableCell>;
                    };

                    const nonKeyClientsByCenter = new Map<string, string[]>();
                    const nonKeyNoCenter: string[] = [];
                    const keyAccounts = clients.filter((c) => c.isKeyAccount);
                    for (const c of clients) {
                      if (c.isKeyAccount) continue;
                      if (c.costCenterId) {
                        const arr = nonKeyClientsByCenter.get(c.costCenterId) ?? [];
                        arr.push(c.id);
                        nonKeyClientsByCenter.set(c.costCenterId, arr);
                      } else {
                        nonKeyNoCenter.push(c.id);
                      }
                    }

                    const centerRows = costCenters
                      .map((cc) => ({ cc, clientIds: nonKeyClientsByCenter.get(cc.id) ?? [] }))
                      .filter(({ clientIds }) => clientIds.length > 0);

                    return (
                      <>
                        {/* Linhas por Centro de Custo */}
                        {centerRows.map(({ cc, clientIds }) => (
                          <TableRow key={`cc-${cc.id}`}>
                            <TableCell className="min-w-40 font-medium whitespace-nowrap bg-background">{cc.name}</TableCell>
                            {daysInMonth.map((d) => (
                              <TableCell key={d} className="text-center">{renderValueCell(getValuesFor(clientIds, d))}</TableCell>
                            ))}
                            {renderTotalCell(daysInMonth.map((d) => getValuesFor(clientIds, d)))}
                            <TableCell className="text-center bg-background w-16 text-xs">-</TableCell>
                          </TableRow>
                        ))}

                        {/* Grupo Sem Centro (agregado) */}
                        {nonKeyNoCenter.length > 0 && (
                          <TableRow key="cc-none">
                            <TableCell className="min-w-40 font-medium whitespace-nowrap bg-background">Sem Centro</TableCell>
                            {daysInMonth.map((d) => (
                              <TableCell key={d} className="text-center">{renderValueCell(getValuesFor(nonKeyNoCenter, d))}</TableCell>
                            ))}
                            {renderTotalCell(daysInMonth.map((d) => getValuesFor(nonKeyNoCenter, d)))}
                            <TableCell className="text-center bg-background w-16 text-xs">-</TableCell>
                          </TableRow>
                        )}

                        {/* Clientes chave (linha individual) */}
                        {keyAccounts.map((c) => (
                          <TableRow key={`ka-${c.id}`}>
                            <TableCell className="min-w-40 font-medium whitespace-nowrap bg-background">{c.name}</TableCell>
                            {daysInMonth.map((d) => {
                              const row = kpiMap[kpi]?.[c.id];
                              const v = row ? row[d] : undefined;
                              return (
                                <TableCell key={d} className="text-center">
                                  {v === undefined
                                    ? "-"
                                    : kpi === "RECEITA"
                                    ? integerFormatter.format(v)
                                    : `${Math.round(Number(v))}%`}
                                </TableCell>
                              );
                            })}
                            {(() => {
                              const values = daysInMonth
                                .map((d) => kpiMap[kpi]?.[c.id]?.[d])
                                .filter((v): v is number => typeof v === "number");
                              if (values.length === 0) {
                                return (
                                  <>
                                    <TableCell className="text-center bg-background w-16 text-xs">-</TableCell>
                                    <TableCell className="text-center bg-background w-16 text-xs">
                                      {(() => {
                                        const v =
                                          kpi === 'RECEITA' ? c.budgetReceita :
                                          kpi === 'ON_TIME' ? c.budgetOnTime :
                                          kpi === 'OCUPACAO' ? c.budgetOcupacao :
                                          kpi === 'TERCEIRO' ? c.budgetTerceiro :
                                          c.budgetDisponibilidade;
                                        if (v == null) return '-';
                                        return kpi === 'RECEITA' ? integerFormatter.format(v) : `${Math.round(v)}%`;
                                      })()}
                                    </TableCell>
                                  </>
                                );
                              }
                              if (kpi === "RECEITA") {
                                const sum = values.reduce((a, b) => a + b, 0);
                                return (
                                  <>
                                    <TableCell className="text-center font-semibold bg-background w-16 text-xs">{integerFormatter.format(sum)}</TableCell>
                                    <TableCell className="text-center bg-background w-16 text-xs">
                                      {(() => {
                                        const v = c.budgetReceita;
                                        if (v == null) return '-';
                                        return integerFormatter.format(v);
                                      })()}
                                    </TableCell>
                                  </>
                                );
                              } else {
                                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                                return (
                                  <>
                                    <TableCell className="text-center font-semibold bg-background w-16 text-xs">{`${Math.round(avg)}%`}</TableCell>
                                    <TableCell className="text-center bg-background w-16 text-xs">
                                      {(() => {
                                        const v =
                                          kpi === 'ON_TIME' ? c.budgetOnTime :
                                          kpi === 'OCUPACAO' ? c.budgetOcupacao :
                                          kpi === 'TERCEIRO' ? c.budgetTerceiro :
                                          c.budgetDisponibilidade;
                                        if (v == null) return '-';
                                        return `${Math.round(v)}%`;
                                      })()}
                                    </TableCell>
                                  </>
                                );
                              }
                            })()}
                          </TableRow>
                        ))}
                      </>
                    );
                  })()}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-semibold">
                      {kpi === "RECEITA" ? "Total" : "Média"}
                    </TableCell>
                     {daysInMonth.map((d) => {
                      const values = clients
                        .map((c) => kpiMap[kpi]?.[c.id]?.[d])
                        .filter((v): v is number => typeof v === "number");
                      if (values.length === 0) {
                        return (
                          <TableCell key={`footer-${d}`} className="text-center">-</TableCell>
                        );
                      }
                      if (kpi === "RECEITA") {
                        const sum = values.reduce((a, b) => a + b, 0);
                        return (
                          <TableCell key={`footer-${d}`} className="text-center font-semibold">
                            {integerFormatter.format(sum)}
                          </TableCell>
                        );
                      } else {
                        const avg = values.reduce((a, b) => a + b, 0) / values.length;
                        return (
                          <TableCell key={`footer-${d}`} className="text-center font-semibold">{`${Math.round(avg)}%`}</TableCell>
                        );
                      }
                    })}
                    {/* Coluna total agregada (todo o mês) */}
                    {(() => {
                      const allValues = clients.flatMap((c) =>
                        daysInMonth
                          .map((d) => kpiMap[kpi]?.[c.id]?.[d])
                          .filter((v): v is number => typeof v === "number")
                      );
                      if (allValues.length === 0) {
                        return <TableCell className="text-center bg-background w-16 text-xs">-</TableCell>;
                      }
                      if (kpi === "RECEITA") {
                        const total = allValues.reduce((a, b) => a + b, 0);
                        return <TableCell className="text-center font-semibold bg-background w-16 text-xs">{integerFormatter.format(total)}</TableCell>;
                      } else {
                        const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length;
                        return <TableCell className="text-center font-semibold bg-background w-16 text-xs">{`${Math.round(avg)}%`}</TableCell>;
                      }
                    })()}
                  </TableRow>
                  {/* Linha Prior Month (comparação com mês anterior até o dia atual quando aplicável) */}
                  <TableRow>
                    <TableCell className="font-semibold">Prior Month</TableCell>
                    {daysInMonth.map((d, idx) => {
                      if (idx + 1 > maxDayToShow) {
                        return (
                          <TableCell key={`prior-${d}`} className="text-center text-muted-foreground">-</TableCell>
                        );
                      }
                      const relevant = clientId ? clients.filter((c) => c.id === clientId) : clients;
                      const vals = relevant.flatMap((c) => {
                        const row = prevKpiMap[kpi]?.[c.id];
                        const v = row ? row[d] : undefined;
                        return typeof v === 'number' ? [v] : [];
                      });
                      if (vals.length === 0) {
                        return <TableCell key={`prior-${d}`} className="text-center">-</TableCell>;
                      }
                      if (kpi === 'RECEITA') {
                        const sum = vals.reduce((a,b)=>a+b,0);
                        return <TableCell key={`prior-${d}`} className="text-center font-semibold">{integerFormatter.format(sum)}</TableCell>;
                      }
                      const avg = vals.reduce((a,b)=>a+b,0) / vals.length;
                      return <TableCell key={`prior-${d}`} className="text-center font-semibold">{`${Math.round(avg)}%`}</TableCell>;
                    })}
                    {(() => {
                      const relevant = clientId ? clients.filter((c) => c.id === clientId) : clients;
                      const allValues = relevant.flatMap((c) =>
                        Array.from({ length: maxDayToShow }, (_, i) => i + 1)
                          .map((d) => prevKpiMap[kpi]?.[c.id]?.[d])
                          .filter((v): v is number => typeof v === 'number')
                      );
                      if (allValues.length === 0) {
                        return <TableCell className="text-center bg-background w-16 text-xs">-</TableCell>;
                      }
                      if (kpi === 'RECEITA') {
                        const total = allValues.reduce((a,b)=>a+b,0);
                        return <TableCell className="text-center font-semibold bg-background w-16 text-xs">{integerFormatter.format(total)}</TableCell>;
                      }
                      const avg = allValues.reduce((a,b)=>a+b,0) / allValues.length;
                      return <TableCell className="text-center font-semibold bg-background w-16 text-xs">{`${Math.round(avg)}%`}</TableCell>;
                    })()}
                    <TableCell className="text-center bg-background w-16 text-xs">-</TableCell>
                  </TableRow>
                  {/* Linha de Meta Diária (última linha) */}
                  <TableRow>
                    <TableCell className="font-semibold">Meta diária</TableCell>
                    {(() => {
                      if (kpi === 'RECEITA') {
                        const monthlyMeta = (clientId ? clients.filter((c) => c.id === clientId) : clients)
                          .reduce((acc, c) => acc + (c.budgetReceita ?? 0), 0);
                        const daily = daysInMonth.length > 0 ? monthlyMeta / daysInMonth.length : 0;
                        return (
                          <>
                            {daysInMonth.map((d) => (
                              <TableCell key={`meta-footer-${d}`} className="text-center text-sm">
                                {monthlyMeta > 0 ? integerFormatter.format(daily) : '-'}
                              </TableCell>
                            ))}
                            <TableCell className="text-center font-semibold bg-background w-16 text-xs">
                              {monthlyMeta > 0 ? integerFormatter.format(monthlyMeta) : '-'}
                            </TableCell>
                            <TableCell className="text-center bg-background w-16 text-xs">-</TableCell>
                          </>
                        );
                      } else {
                        const pick = (c: typeof clients[number]) => (
                          kpi === 'ON_TIME' ? c.budgetOnTime :
                          kpi === 'OCUPACAO' ? c.budgetOcupacao :
                          kpi === 'TERCEIRO' ? c.budgetTerceiro :
                          c.budgetDisponibilidade
                        );
                        const relevant = clientId ? clients.filter((c) => c.id === clientId) : clients;
                        const vals = relevant.map(pick).filter((v): v is number => typeof v === 'number');
                        const avg = vals.length ? (vals.reduce((a,b)=>a+b,0) / vals.length) : undefined;
                        const avgStr = avg == null ? '-' : `${Math.round(avg)}%`;
                        return (
                          <>
                            {daysInMonth.map((d) => (
                              <TableCell key={`meta-footer-${d}`} className="text-center text-sm">{avgStr}</TableCell>
                            ))}
                            <TableCell className="text-center font-semibold bg-background w-16 text-xs">{avgStr}</TableCell>
                            <TableCell className="text-center bg-background w-16 text-xs">-</TableCell>
                          </>
                        );
                      }
                    })()}
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


