import { DashboardLayout } from "~/components/dashboard-layout";
import { ClientList } from "~/components/clients";

export default function ClientsPage() {
  return (
    <DashboardLayout>
      <ClientList />
    </DashboardLayout>
  );
}