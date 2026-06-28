import type { DashboardSummary } from "../types";
import { formatMoney } from "../format";

interface Card {
  label: string;
  value: string;
  accent: string;
}

export default function Dashboard({ summary }: { summary: DashboardSummary | null }) {
  if (!summary) {
    return <div className="text-slate-400">Загрузка сводки…</div>;
  }

  const cards: Card[] = [
    { label: "Всего оплат", value: formatMoney(summary.total_amount), accent: "text-slate-900" },
    { label: "Проектов", value: String(summary.total_projects), accent: "text-slate-900" },
    { label: "Платежей", value: String(summary.total_payments), accent: "text-slate-900" },
    { label: "Закрыто", value: formatMoney(summary.closed_amount), accent: "text-green-600" },
    { label: "Не закрыто", value: formatMoney(summary.not_closed_amount), accent: "text-amber-600" },
    { label: "Без акта", value: String(summary.payments_without_act), accent: "text-slate-900" },
    { label: "Ждут подписи", value: String(summary.payments_waiting_signature), accent: "text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="text-xs uppercase tracking-wide text-slate-400">
            {card.label}
          </div>
          <div className={`mt-2 text-lg font-semibold ${card.accent}`}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
