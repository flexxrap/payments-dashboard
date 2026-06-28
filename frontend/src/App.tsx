import { useCallback, useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import ProjectsTable from "./components/ProjectsTable";
import PaymentsTable from "./components/PaymentsTable";
import Filters from "./components/Filters";
import {
  getClients,
  getPayments,
  getProjects,
  getSummary,
  updateAct,
} from "./api/client";
import type {
  Client,
  DashboardSummary,
  Payment,
  PaymentFilters,
  ProjectListItem,
} from "./types";

export default function App() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [filters, setFilters] = useState<PaymentFilters>({});

  const loadAggregates = useCallback(async () => {
    const [summaryData, projectsData, clientsData] = await Promise.all([
      getSummary(),
      getProjects(),
      getClients(),
    ]);
    setSummary(summaryData);
    setProjects(projectsData);
    setClients(clientsData);
  }, []);

  const loadPayments = useCallback(async () => {
    const data = await getPayments(filters);
    setPayments(data);
    setStages((prev) => {
      const set = new Set(prev);
      data.forEach((p) => p.service_stage && set.add(p.service_stage));
      return Array.from(set).sort();
    });
  }, [filters]);

  useEffect(() => {
    loadAggregates();
  }, [loadAggregates]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  async function patchAct(paymentId: number, payload: { is_sent?: boolean; is_signed?: boolean }) {
    const updated = await updateAct(paymentId, payload);
    setPayments((prev) => prev.map((p) => (p.id === paymentId ? updated : p)));
    loadAggregates();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Учет оплат и закрывающих документов
        </h1>
        <p className="text-sm text-slate-500">
          Оплаты, проекты и статусы актов digital-агентства
        </p>
      </header>

      <section className="mb-8">
        <Dashboard summary={summary} />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Проекты</h2>
        <ProjectsTable projects={projects} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Оплаты</h2>
        <Filters
          clients={clients}
          projects={projects}
          stages={stages}
          filters={filters}
          onChange={setFilters}
        />
        <PaymentsTable
          payments={payments}
          onMarkSent={(id) => patchAct(id, { is_sent: true })}
          onMarkSigned={(id) => patchAct(id, { is_signed: true })}
        />
      </section>
    </div>
  );
}
