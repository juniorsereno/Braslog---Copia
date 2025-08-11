"use client";

import { memo, useState } from "react";
import { api } from "~/trpc/react";
import { useErrorHandler } from "~/hooks/use-error-handler";
import { useDebounce } from "~/hooks/use-debounce";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { Edit, Trash2, Building2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { CostCenter } from "~/lib/validations/cost-center";

interface CostCenterListProps {
  onEdit: (cc: CostCenter) => void;
}

function CostCenterListComponent({ onEdit }: CostCenterListProps) {
  const { handleError } = useErrorHandler();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [deleting, setDeleting] = useState<CostCenter | null>(null);

  const itemsPerPage = 20;
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, error, refetch } = api.costCenter.getAll.useQuery(
    {
      search: debouncedSearch.trim() || undefined,
      limit: itemsPerPage,
      offset: currentPage * itemsPerPage,
    },
    { placeholderData: (prev) => prev, refetchOnWindowFocus: false, staleTime: 60_000 },
  );

  const deleteMutation = api.costCenter.delete.useMutation({
    onSuccess: () => {
      setDeleting(null);
      void refetch();
    },
    onError: (e) => handleError(e, "Erro ao excluir centro de custo"),
  });

  if (error) {
    handleError(error, "Erro ao carregar centros de custo");
  }

  const centers = data?.costCenters ?? [];

  const getStatusBadge = (status: "ATIVO" | "INATIVO") => (
    <Badge variant={status === "ATIVO" ? "default" : "secondary"}>{status}</Badge>
  );

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
      new Date(date),
    );

  const resetPage = () => setCurrentPage(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>Centros de Custo</span>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar centros..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPage();
          }}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Clientes</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Atualizado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[60px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end space-x-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : centers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum centro encontrado
                </TableCell>
              </TableRow>
            ) : (
              centers.map((cc) => (
                <TableRow key={cc.id}>
                  <TableCell className="font-medium">{cc.name}</TableCell>
                  <TableCell>{getStatusBadge(cc.status as any)}</TableCell>
                  <TableCell>{typeof cc.clientCount === 'number' ? cc.clientCount : '-'}</TableCell>
                  <TableCell>{formatDate(cc.createdAt)}</TableCell>
                  <TableCell>{formatDate(cc.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(cc)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleting(cc)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.totalCount > itemsPerPage && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {currentPage * itemsPerPage + 1} a {Math.min((currentPage + 1) * itemsPerPage, data.totalCount)} de {data.totalCount} centros
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="text-sm text-muted-foreground">
              Página {currentPage + 1} de {Math.ceil(data.totalCount / itemsPerPage)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!data.hasMore}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {deleting && (
        <div className="flex items-center justify-end gap-3 rounded-md border p-3 bg-muted/30">
          <div className="text-sm">
            Confirmar exclusão do centro <span className="font-medium">{deleting.name}</span>?
          </div>
          <Button variant="outline" size="sm" onClick={() => setDeleting(null)} disabled={deleteMutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteMutation.mutate({ id: deleting.id })}
            disabled={deleteMutation.isPending}
          >
            Excluir
          </Button>
        </div>
      )}
    </div>
  );
}

export const CostCenterList = memo(CostCenterListComponent);


