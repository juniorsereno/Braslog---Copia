"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

type MetricType = "currency" | "percent";

interface MetricCardProps {
	title: string;
	dayOfMonth: number;
	real: number;
	bgt: number;
	pm: number;
	type: MetricType;
}

function formatCurrencyBRL(value: number): string {
	return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(value || 0);
}

function formatPercent(value: number): string {
	return new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 2 }).format((value ?? 0) / 100);
}

export function MetricCard({ title, dayOfMonth, real, bgt, pm, type }: MetricCardProps) {
	const formatter = type === "currency" ? formatCurrencyBRL : formatPercent;

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<Badge variant="secondary">{String(dayOfMonth)}°</Badge>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
					<div>
						<div className="text-xs">REAL</div>
						<div className="font-semibold text-foreground">{formatter(real)}</div>
					</div>
					<div>
						<div className="text-xs">BGT</div>
						<div className="font-semibold text-foreground">{formatter(bgt)}</div>
					</div>
					<div>
						<div className="text-xs">PM</div>
						<div className="font-semibold text-foreground">{formatter(pm)}</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}


