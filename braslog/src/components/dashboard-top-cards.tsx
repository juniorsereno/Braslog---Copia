"use client";

import { api } from "~/trpc/react";
import { MetricCard } from "~/components/ui/metric-card";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

interface DashboardTopCardsProps {
	date?: string; // YYYY-MM-DD; default: hoje
	clientIds?: string[];
	costCenterIds?: string[];
}

function getTodayIso(): string {
	const now = new Date();
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, "0");
	const d = String(now.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export function DashboardTopCards({ date, clientIds, costCenterIds }: DashboardTopCardsProps) {
	const refDate = date ?? getTodayIso();
	const { data, isFetching } = api.kpiEntry.getDashboardSummary.useQuery({ date: refDate, clientIds, costCenterIds }, {
		placeholderData: (prev) => prev,
		staleTime: 60 * 1000,
		refetchOnWindowFocus: false,
	});

	if (isFetching && !data) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
				{Array.from({ length: 5 }).map((_, i) => (
					<Card key={i} className="p-4">
						<div className="flex items-center justify-between mb-3">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-6 w-10" />
						</div>
						<div className="grid grid-cols-3 gap-2">
							<Skeleton className="h-5 w-16" />
							<Skeleton className="h-5 w-16" />
							<Skeleton className="h-5 w-16" />
						</div>
					</Card>
				))}
			</div>
		);
	}

	const day = data?.dayOfMonth ?? new Date(refDate).getDate();
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
			<MetricCard title="Receita" dayOfMonth={day} type="currency" real={data?.receita.real ?? 0} bgt={data?.receita.bgt ?? 0} pm={data?.receita.pm ?? 0} />
			<MetricCard title="On Time" dayOfMonth={day} type="percent" real={data?.onTime.real ?? 0} bgt={data?.onTime.bgt ?? 0} pm={data?.onTime.pm ?? 0} />
			<MetricCard title="Ocupação" dayOfMonth={day} type="percent" real={data?.ocupacao.real ?? 0} bgt={data?.ocupacao.bgt ?? 0} pm={data?.ocupacao.pm ?? 0} />
			<MetricCard title="Terceiro" dayOfMonth={day} type="percent" real={data?.terceiro.real ?? 0} bgt={data?.terceiro.bgt ?? 0} pm={data?.terceiro.pm ?? 0} />
			<MetricCard title="Disponibilidade" dayOfMonth={day} type="percent" real={data?.disponibilidade.real ?? 0} bgt={data?.disponibilidade.bgt ?? 0} pm={data?.disponibilidade.pm ?? 0} />
		</div>
	);
}


