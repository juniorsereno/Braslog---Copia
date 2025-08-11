"use client";

import { 
  BarChart3, 
  Users, 
  Home, 
  LogOut,
  Settings,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { api } from "~/trpc/react";

// Menu items principais
const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    description: "Visão geral do sistema"
  },
  {
    title: "Lançamento de KPIs",
    url: "/dashboard/kpis",
    icon: TrendingUp,
    description: "Inserir dados diários"
  },
  {
    title: "Gerenciar Clientes",
    url: "/dashboard/clients",
    icon: Users,
    description: "CRUD de clientes"
  },
  {
    title: "Relatórios",
    url: "/dashboard/reports",
    icon: BarChart3,
    description: "Análises e relatórios"
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = api.auth.getSession.useQuery();
  const signOutMutation = api.auth.signOut.useMutation({
    onSuccess: () => {
      // Recarregar a página para limpar o estado
      window.location.href = "/";
    },
  });

  const handleSignOut = () => {
    signOutMutation.mutate();
  };

  return (
    <Sidebar className="transition-[width] duration-300 ease-in-out">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Sistema Logística</span>
            <span className="truncate text-xs text-sidebar-foreground/70">
              Análise de KPIs
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    tooltip={item.description}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === "/dashboard/settings"}
                  tooltip="Configurações do sistema"
                >
                  <Link href="/dashboard/settings">
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg transition-transform data-[state=open]:scale-95">
                    <AvatarFallback className="rounded-lg">
                      {session?.user?.email?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {session?.user?.email ?? "Usuário"}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/70">
                      {session?.isAuthenticated ? "Online" : "Offline"}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="gap-2 text-red-600 focus:text-red-600"
                  onClick={handleSignOut}
                  disabled={signOutMutation.isPending}
                >
                  <LogOut className="h-4 w-4" />
                  <span>
                    {signOutMutation.isPending ? "Saindo..." : "Sair"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}