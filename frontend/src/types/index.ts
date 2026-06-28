export type ActStatus =
  | "not_sent"
  | "waiting_signature"
  | "attention_required"
  | "closed";

export interface Client {
  id: number;
  name: string;
  inn: string;
  ogrn?: string | null;
  bank_account?: string | null;
  contact_person?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectListItem {
  id: number;
  name: string;
  status: string;
  client_id: number;
  client_name: string;
  total_amount: string;
  payments_count: number;
  closed_acts: number;
  open_acts: number;
  overall_act_status: ActStatus;
}

export interface Act {
  id: number;
  payment_id: number;
  is_sent: boolean;
  sent_at?: string | null;
  is_signed: boolean;
  signed_at?: string | null;
  status: ActStatus;
  manager_comment?: string | null;
}

export interface Payment {
  id: number;
  project_id: number;
  client_id: number;
  payment_date: string;
  amount: string;
  payment_purpose?: string | null;
  service_stage?: string | null;
  invoice_number?: string | null;
  contract_number?: string | null;
  created_at: string;
  updated_at: string;
  client_name: string;
  project_name: string;
  act: Act | null;
}

export interface DashboardSummary {
  total_amount: string;
  total_projects: number;
  total_payments: number;
  closed_amount: string;
  not_closed_amount: string;
  payments_without_act: number;
  payments_waiting_signature: number;
}

export interface PaymentFilters {
  project_id?: number;
  client_id?: number;
  date_from?: string;
  date_to?: string;
  act_status?: ActStatus;
  service_stage?: string;
  search?: string;
}

export interface ActUpdate {
  is_sent?: boolean;
  is_signed?: boolean;
  manager_comment?: string;
}
