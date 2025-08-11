"use client";

import { useState } from "react";
import { DashboardLayout } from "~/components/dashboard-layout";
// Removido import não utilizado do Card e variantes
import { TrendingUp } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { KpiPivotHistory } from "~/components/kpis/KpiPivotHistory";
import { KpiEntryForm } from "~/components/kpis/KpiEntryForm";

export default function KpisPage() {
  const [openForm, setOpenForm] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lançamento de KPIs</h1>
            <p className="text-muted-foreground">
              Insira os dados diários dos indicadores de performance
            </p>
          </div>
          <div className="ml-auto">
            <Button onClick={() => setOpenForm(true)}>
              Adicionar lançamentos
            </Button>
          </div>
        </div>

        <KpiPivotHistory />

        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogContent className="w-[45vw] sm:max-w-7xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Novo lançamento de KPIs
              </DialogTitle>
            </DialogHeader>
            <KpiEntryForm onSaved={() => setOpenForm(false)} onCancel={() => setOpenForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}