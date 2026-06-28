import { useState } from "react";
import type { Payment } from "../types";
import { formatDate, formatMoney } from "../format";
import ActStatusBadge from "./ActStatusBadge";

interface Props {
  payments: Payment[];
  onMarkSent: (paymentId: number) => void;
  onMarkSigned: (paymentId: number) => void;
}

export default function PaymentsTable({ payments, onMarkSent, onMarkSigned }: Props) {
  const [pending, setPending] = useState<number | null>(null);

  async function run(action: () => void, id: number) {
    setPending(id);
    try {
      await action();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Дата</th>
            <th className="px-4 py-3">Клиент</th>
            <th className="px-4 py-3">Проект</th>
            <th className="px-4 py-3">Сумма</th>
            <th className="px-4 py-3">Назначение</th>
            <th className="px-4 py-3">Этап</th>
            <th className="px-4 py-3">Статус акта</th>
            <th className="px-4 py-3">Действия</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => {
            const act = payment.act;
            const busy = pending === payment.id;
            return (
              <tr key={payment.id} className="border-t border-slate-100 align-top">
                <td className="whitespace-nowrap px-4 py-3">
                  {formatDate(payment.payment_date)}
                </td>
                <td className="px-4 py-3 text-slate-600">{payment.client_name}</td>
                <td className="px-4 py-3 text-slate-600">{payment.project_name}</td>
                <td className="whitespace-nowrap px-4 py-3 font-medium">
                  {formatMoney(payment.amount)}
                </td>
                <td className="max-w-[220px] px-4 py-3 text-slate-600">
                  {payment.payment_purpose}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {payment.service_stage}
                </td>
                <td className="px-4 py-3">
                  {act ? <ActStatusBadge status={act.status} /> : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      disabled={busy || !act || act.is_sent}
                      onClick={() => run(() => onMarkSent(payment.id), payment.id)}
                      className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      Акт отправлен
                    </button>
                    <button
                      disabled={busy || !act || act.is_signed}
                      onClick={() => run(() => onMarkSigned(payment.id), payment.id)}
                      className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      Акт подписан
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {payments.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                Нет оплат по выбранным фильтрам
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
