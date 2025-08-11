"use client";

import { useState, memo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { Plus, Search, Edit, Trash2, Users, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { ClientModal } from "./client-modal";
import { DeleteClientDialog } from "./delete-client-dialog";
import { CostCenterModal } from "./cost-center-modal";
import { CostCenterList } from "./cost-center-list";
import type { Client, ClientStatus } from "~/lib/validations/client";

interface ClientListProps {
  onClientSelect?: (client: Client) => void;
  selectable?: boolean;
}

function ClientListComponent({ onClientSelect, selectable = false }: ClientListProps) {
  const { handleError } = useErrorHandler();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isCostCenterModalOpen, setIsCostCenterModalOpen] = useState(false);

  const itemsPerPage = 20;

  // Debounce da busca para evitar muitas chamadas à API
  const debouncedSearch = useDebounce(search, 300);

  // Query para buscar clientes
  const {
    data: clientsData,
    isLoading,
    error,
    refetch,
  } = api.client.getAll.useQuery(
    {
      search: debouncedSearch.trim() || undefined,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      limit: itemsPerPage,
      offset: currentPage * itemsPerPage,
    },
    {
      // Mantém os dados anteriores durante a paginação/filtro para UX mais fluido
      placeholderData: (prev) => prev,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  );

  // Buscar centros de custo para exibir o nome na lista de clientes
  const { data: costCentersData } = api.costCenter.getAll.useQuery(
    { limit: 100, offset: 0 },
    { refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 },
  );
  const costCenterIdToName = new Map<string, string>(
    (costCentersData?.costCenters ?? []).map((cc) => [cc.id, cc.name]),
  );

  // Reset da página quando filtros mudam
  const resetPage = () => setCurrentPage(0);

  // Query para estatísticas
  const { data: stats } = api.client.getStats.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Tratar erros
  if (error) {
    handleError(error, "Erro ao carregar clientes");
  }

  const clients = clientsData?.clients ?? [];

  const handleCreateClient = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    setDeletingClient(client);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    void refetch();
  };

  const handleDeleteSuccess = () => {
    setDeletingClient(null);
    void refetch();
  };

  const getStatusBadge = (status: ClientStatus) => {
    return (
      <Badge variant={status === "ATIVO" ? "default" : "secondary"}>
        {status}
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Gerenciar Clientes e Centros de Custo
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os clientes do sistema de análise logística
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsCostCenterModalOpen(true)}>
            <Building2 className="mr-2 h-4 w-4" />
            Novo Centro de Custo
          </Button>
          <Button onClick={handleCreateClient}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Ativos</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-gray-500" />
              <span className="text-sm font-medium">Inativos</span>
            </div>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as ClientStatus | "ALL");
            resetPage();
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="ATIVO">Ativos</SelectItem>
            <SelectItem value="INATIVO">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela Clientes */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Centro de Custo</TableHead>
              <TableHead>Exibir no Histórico</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Atualizado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
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
            ) : clients.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {search || statusFilter !== "ALL"
                        ? "Nenhum cliente encontrado com os filtros aplicados"
                        : "Nenhum cliente cadastrado"}
                    </p>
                    {!search && statusFilter === "ALL" && (
                      <Button onClick={handleCreateClient} variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar primeiro cliente
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              clients.map((client) => (
                <TableRow
                  key={client.id}
                  className={selectable ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={selectable ? () => onClientSelect?.(client) : undefined}
                >
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{getStatusBadge(client.status)}</TableCell>
                  <TableCell>
                    {client.costCenterId
                      ? (costCenterIdToName.get(client.costCenterId) ?? "-")
                      : "-"}
                  </TableCell>
                  <TableCell>{client.isKeyAccount ? "Sim" : "Não"}</TableCell>
                  <TableCell>{formatDate(client.createdAt)}</TableCell>
                  <TableCell>{formatDate(client.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClient(client);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client);
                        }}
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

      {/* Lista de Centros de Custo */}
      <CostCenterList onEdit={(cc) => {
        // Reaproveitar modal de cost center para edição
        setIsCostCenterModalOpen(true);
        // passaremos via prop do modal? Simplificamos: abrir modal em modo de criação por enquanto
        // Para edição avançada, mover estado para acima e passar costCenter como prop
      }} />

      {/* Paginação */}
      {clientsData && clientsData.totalCount > itemsPerPage && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {currentPage * itemsPerPage + 1} a{" "}
            {Math.min((currentPage + 1) * itemsPerPage, clientsData.totalCount)} de{" "}
            {clientsData.totalCount} clientes
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
              Página {currentPage + 1} de {Math.ceil(clientsData.totalCount / itemsPerPage)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!clientsData.hasMore}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        client={editingClient}
      />

      <CostCenterModal
        isOpen={isCostCenterModalOpen}
        onClose={() => setIsCostCenterModalOpen(false)}
      />

      <DeleteClientDialog
        client={deletingClient}
        onClose={() => setDeletingClient(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

// Memoizar o componente para evitar re-renders desnecessários
export const ClientList = memo(ClientListComponent);