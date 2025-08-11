"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useErrorHandler, useMutationHandlers } from "~/hooks/use-error-handler";
import { type KpiFormData } from "~/lib/validations/kpi";
import { Undo2, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "~/components/ui/alert-dialog";

type Props = {
  defaultDate?: string;
  onSaved?: () => void;
  onCancel?: () => void;
};

export function KpiEntryForm({ defaultDate, onSaved, onCancel }: Props) {
  const todayStr = useMemo<string>(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState<string>(todayStr);

  // Sincronizar data inicial com prop quando fornecida
  useEffect(() => {
    if (typeof defaultDate === "string" && defaultDate.length > 0) {
      setDate(defaultDate);
    }
  }, [defaultDate]);

  const { handleError, handleSuccess } = useErrorHandler();
  const { createMutationHandlers } = useMutationHandlers();

  // Buscar clientes (até 100 por vez)
  const { data: clientsResp, isLoading: loadingClients } = api.client.getAll.useQuery(
    { limit: 100, offset: 0 },
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      placeholderData: (prev) => prev,
    },
  );
  const clients = useMemo(() => clientsResp?.clients ?? [], [clientsResp]);
  const clientsById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);

  // Buscar entradas existentes da data selecionada
  const { data: existingForDate, isFetching: loadingEntries, refetch } = api.kpiEntry.getByDate.useQuery(
    { date },
    {
      enabled: !!date,
      // Mantém dados do dia anterior ao trocar rapidamente de data
      placeholderData: (prev) => prev,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  // Estado do formulário (um registro por cliente, com 5 KPIs)
  const [formData, setFormData] = useState<KpiFormData>({ date, entries: [] });
  // Snapshot inicial para detectar alterações
  const initialFormRef = useRef<KpiFormData>({ date, entries: [] });
  // Mapa de IDs existentes por célula
  const [entryIdMap, setEntryIdMap] = useState<Record<string, string>>({});
  // Confirmação de exclusão
  const [deleteTarget, setDeleteTarget] = useState<{ clientId: string; field: KpiKey } | null>(null);

  type KpiKey = "receita" | "onTime" | "ocupacao" | "terceiro" | "disponibilidade";

  // Virtualização das linhas da tabela
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(640); // fallback
  const rowHeight = 56; // altura média de uma linha
  const overscan = 8;
  const totalRows = formData.entries.length;
  const virtualizationEnabled = totalRows > 60;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const updateSize = () => setContainerHeight(el.clientHeight || 640);
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const startIndex = virtualizationEnabled
    ? Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    : 0;
  const visibleCount = virtualizationEnabled
    ? Math.ceil(containerHeight / rowHeight) + overscan * 2
    : totalRows;
  const endIndex = virtualizationEnabled
    ? Math.min(totalRows, startIndex + visibleCount)
    : totalRows;
  const topPad = virtualizationEnabled ? startIndex * rowHeight : 0;
  const bottomPad = virtualizationEnabled ? Math.max(0, totalRows * rowHeight - endIndex * rowHeight) : 0;

  // Resumo (Total receita, médias percentuais)
  // resumo removido (não utilizado no formulário)

  // Rehidratar o formulário quando clientes ou entradas mudarem
  useEffect(() => {
    const baseEntries = clients.map((c) => ({ clientId: c.id }));
    const populated = existingForDate?.formData
      ? mergeForm(baseEntries, existingForDate.formData.entries)
      : baseEntries;

    setFormData({ date, entries: populated });
    // Atualiza snapshot e mapa de IDs
    initialFormRef.current = { date, entries: populated };
    const map: Record<string, string> = {};
    for (const e of existingForDate?.entries ?? []) {
      const key = (type: string) => `${e.clientId}:${type}`;
      switch (e.kpiType) {
        case "RECEITA":
          map[key("receita")] = e.id; break;
        case "ON_TIME":
          map[key("onTime")] = e.id; break;
        case "OCUPACAO":
          map[key("ocupacao")] = e.id; break;
        case "TERCEIRO":
          map[key("terceiro")] = e.id; break;
        case "DISPONIBILIDADE":
          map[key("disponibilidade")] = e.id; break;
      }
    }
    setEntryIdMap(map);
  }, [clients, existingForDate, date]);

  // Salvar
  const upsertMany = api.kpiEntry.upsertMany.useMutation({
    ...createMutationHandlers("Dados salvos com sucesso", "Erro ao salvar dados de KPI"),
    onSuccess: async () => {
      handleSuccess("Dados de KPI salvos com sucesso");
      onSaved?.();
    },
  });

  const onChangeValue = (
    clientId: string,
    field: KpiKey,
    value: string,
  ) => {
    let numeric = value === "" ? undefined : Number(value);
    // Máscara/normalização: clamp 0-100 para percentuais
    if (numeric !== undefined && field !== "receita") {
      if (Number.isNaN(numeric)) numeric = undefined;
      else numeric = Math.max(0, Math.min(100, numeric));
    }
    setFormData((prev) => ({
      ...prev,
      entries: prev.entries.map((e) =>
        e.clientId === clientId ? { ...e, [field]: numeric } : e,
      ),
    }));
  };

  const isDirtyCell = (clientId: string, field: KpiKey): boolean => {
    const current = formData.entries.find((e) => e.clientId === clientId);
    const initial = initialFormRef.current.entries.find((e) => e.clientId === clientId) as Partial<Record<KpiKey, number>> | undefined;
    const curVal = current?.[field];
    const initVal = initial?.[field];
    return curVal !== initVal;
  };

  const revertCell = (clientId: string, field: KpiKey) => {
    const initial = initialFormRef.current.entries.find((e) => e.clientId === clientId) as Partial<Record<KpiKey, number>> | undefined;
    const initVal = initial ? initial[field] : undefined;
    setFormData((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => (e.clientId === clientId ? { ...e, [field]: initVal } : e)),
    }));
  };

  const revertAll = () => {
    setFormData(initialFormRef.current);
  };

  const deleteMutation = api.kpiEntry.delete.useMutation(
    createMutationHandlers("Entrada de KPI excluída", "Erro ao excluir entrada de KPI"),
  );

  const deleteCell = async (clientId: string, field: KpiKey) => {
    const key = `${clientId}:${field}`;
    const id = entryIdMap[key];
    try {
      if (id) {
        await deleteMutation.mutateAsync({ id });
        // limpar valor e id
        setFormData((prev) => ({
          ...prev,
          entries: prev.entries.map((e) => (e.clientId === clientId ? { ...e, [field]: undefined } : e)),
        }));
        setEntryIdMap((prev) => {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        });
      } else {
        // não salvo ainda: apenas limpa valor
        setFormData((prev) => ({
          ...prev,
          entries: prev.entries.map((e) => (e.clientId === clientId ? { ...e, [field]: undefined } : e)),
        }));
      }
    } catch (err) {
      handleError(err, "Falha ao excluir entrada de KPI");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSave = async () => {
    try {
      await upsertMany.mutateAsync({ date, entries: formData.entries });
      await refetch();
    } catch (err) {
      handleError(err, "Falha ao salvar os dados de KPI");
    }
  };

  const isBusy = loadingClients || loadingEntries || upsertMany.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="pt-2">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex flex-col gap-2">
            <Label htmlFor="kpi-date">Data</Label>
            <Input
              id="kpi-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={revertAll} disabled={isBusy} className="mr-2">
              <Undo2 className="h-4 w-4 mr-1" /> Desfazer tudo
            </Button>
            <Button variant="outline" onClick={onCancel} disabled={isBusy}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isBusy}>
              {upsertMany.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="overflow-auto"
          style={{ maxHeight: "70vh" }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Receita (BRL)</TableHead>
                <TableHead>On Time (%)</TableHead>
                <TableHead>Ocupação (%)</TableHead>
                <TableHead>Terceiro (%)</TableHead>
                <TableHead>Disponibilidade (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Espaço superior para virtualização */}
              {virtualizationEnabled && topPad > 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <div style={{ height: topPad }} />
                  </TableCell>
                </TableRow>
              )}

              {/* Linhas visíveis */}
              {formData.entries.slice(startIndex, endIndex).map((entry) => {
                const client = clientsById.get(entry.clientId);
                return (
                  <TableRow key={entry.clientId} style={{ height: rowHeight }}>
                          <TableCell className="min-w-48">{client?.name ?? entry.clientId}</TableCell>
                          <TableCell>
                            <div className="relative">
                              <Input
                                className="no-spinner pr-16"
                                inputMode="decimal"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0,00"
                                value={entry.receita ?? ""}
                                onChange={(e) => onChangeValue(entry.clientId, "receita", e.target.value)}
                              />
                              <CellActions
                                dirty={isDirtyCell(entry.clientId, "receita")}
                                onRevert={() => revertCell(entry.clientId, "receita")}
                                onDelete={() => setDeleteTarget({ clientId: entry.clientId, field: "receita" })}
                                canDelete={Boolean(entryIdMap[`${entry.clientId}:receita`])}
                                overlay
                              />
                              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">BRL</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="relative">
                              <Input
                                className="no-spinner pr-16"
                                type="number"
                                inputMode="decimal"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="%"
                                value={entry.onTime ?? ""}
                                onChange={(e) => onChangeValue(entry.clientId, "onTime", e.target.value)}
                              />
                              <CellActions
                                dirty={isDirtyCell(entry.clientId, "onTime")}
                                onRevert={() => revertCell(entry.clientId, "onTime")}
                                onDelete={() => setDeleteTarget({ clientId: entry.clientId, field: "onTime" })}
                                canDelete={Boolean(entryIdMap[`${entry.clientId}:onTime`])}
                                overlay
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="relative">
                              <Input
                                className="no-spinner pr-16"
                                type="number"
                                inputMode="decimal"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="%"
                                value={entry.ocupacao ?? ""}
                                onChange={(e) => onChangeValue(entry.clientId, "ocupacao", e.target.value)}
                              />
                              <CellActions
                                dirty={isDirtyCell(entry.clientId, "ocupacao")}
                                onRevert={() => revertCell(entry.clientId, "ocupacao")}
                                onDelete={() => setDeleteTarget({ clientId: entry.clientId, field: "ocupacao" })}
                                canDelete={Boolean(entryIdMap[`${entry.clientId}:ocupacao`])}
                                overlay
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="relative">
                              <Input
                                className="no-spinner pr-16"
                                type="number"
                                inputMode="decimal"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="%"
                                value={entry.terceiro ?? ""}
                                onChange={(e) => onChangeValue(entry.clientId, "terceiro", e.target.value)}
                              />
                              <CellActions
                                dirty={isDirtyCell(entry.clientId, "terceiro")}
                                onRevert={() => revertCell(entry.clientId, "terceiro")}
                                onDelete={() => setDeleteTarget({ clientId: entry.clientId, field: "terceiro" })}
                                canDelete={Boolean(entryIdMap[`${entry.clientId}:terceiro`])}
                                overlay
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="relative">
                              <Input
                                className="no-spinner pr-16"
                                type="number"
                                inputMode="decimal"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="%"
                                value={entry.disponibilidade ?? ""}
                                onChange={(e) => onChangeValue(entry.clientId, "disponibilidade", e.target.value)}
                              />
                              <CellActions
                                dirty={isDirtyCell(entry.clientId, "disponibilidade")}
                                onRevert={() => revertCell(entry.clientId, "disponibilidade")}
                                onDelete={() => setDeleteTarget({ clientId: entry.clientId, field: "disponibilidade" })}
                                canDelete={Boolean(entryIdMap[`${entry.clientId}:disponibilidade`])}
                                overlay
                              />
                            </div>
                          </TableCell>
                  </TableRow>
                );
              })}

              {/* Espaço inferior para virtualização */}
              {virtualizationEnabled && bottomPad > 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <div style={{ height: bottomPad }} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          {/* Removido footer de resumo: solicitado apenas para visão histórica */}
          </Table>
        </div>

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação removerá o valor salvo desta célula. Você pode desfazer apenas se salvar novamente o valor.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => deleteTarget && deleteCell(deleteTarget.clientId, deleteTarget.field)}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function mergeForm(
  base: KpiFormData["entries"],
  existing: KpiFormData["entries"],
): KpiFormData["entries"] {
  const map = new Map(base.map((e) => [e.clientId, { ...e }]));
  for (const e of existing) {
    const current = map.get(e.clientId) ?? { clientId: e.clientId };
    map.set(e.clientId, { ...current, ...e });
  }
  return Array.from(map.values());
}

function CellActions({ dirty, onRevert, onDelete, canDelete, overlay }: {
  dirty: boolean;
  onRevert: () => void;
  onDelete: () => void;
  canDelete: boolean;
  overlay?: boolean;
}) {
  if (!dirty && !canDelete) return null;
  const wrapCls = overlay
    ? "absolute inset-y-0 right-1 flex items-center gap-1"
    : "mt-1 flex items-center gap-1";
  return (
    <div className={wrapCls}>
      {dirty && (
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={onRevert}>
          <Undo2 className="h-4 w-4" />
        </Button>
      )}
      {canDelete && (
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-red-600" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}


