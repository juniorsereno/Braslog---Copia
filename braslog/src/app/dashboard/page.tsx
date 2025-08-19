import { DashboardLayout } from "~/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { BarChart3, Users, TrendingUp, Calendar } from "lucide-react";
import { DashboardTopCards } from "~/components/dashboard-top-cards";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao Sistema de Análise Logística
          </p>
        </div>

        {/* Top cards de KPIs (REAL, BGT, PM) */}
        <DashboardTopCards />

        {/* Cards de ações rápidas */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesse rapidamente as funcionalidades principais
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <div className="flex items-center gap-2 p-2 rounded-lg border hover:bg-accent cursor-pointer">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Lançar KPIs do Dia</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg border hover:bg-accent cursor-pointer">
                <Users className="h-4 w-4" />
                <span className="text-sm">Gerenciar Clientes</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg border hover:bg-accent cursor-pointer">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm">Ver Relatórios</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>
                Informações sobre o funcionamento atual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Autenticação</span>
                <Badge variant="default" className="bg-green-500">
                  Ativo
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Banco de Dados</span>
                <Badge variant="default" className="bg-green-500">
                  Conectado
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API tRPC</span>
                <Badge variant="default" className="bg-green-500">
                  Funcionando
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Interface</span>
                <Badge variant="default" className="bg-green-500">
                  Carregada
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}