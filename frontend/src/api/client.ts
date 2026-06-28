import axios from "axios";
import type {
  ActUpdate,
  Client,
  DashboardSummary,
  Payment,
  PaymentFilters,
  ProjectListItem,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

export async function getClients(): Promise<Client[]> {
  const { data } = await api.get<Client[]>("/api/clients");
  return data;
}

export async function getProjects(): Promise<ProjectListItem[]> {
  const { data } = await api.get<ProjectListItem[]>("/api/projects");
  return data;
}

export async function getPayments(filters: PaymentFilters): Promise<Payment[]> {
  const params: Record<string, string | number> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params[key] = value;
    }
  });
  const { data } = await api.get<Payment[]>("/api/payments", { params });
  return data;
}

export async function getSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>("/api/dashboard/summary");
  return data;
}

export async function updateAct(
  paymentId: number,
  payload: ActUpdate
): Promise<Payment> {
  const { data } = await api.patch<Payment>(
    `/api/payments/${paymentId}/act`,
    payload
  );
  return data;
}
