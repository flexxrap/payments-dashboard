import { useState } from "react";
import type { Payment } from "../types";
import { formatDate, formatMoney } from "../format";
import ActStatusBadge from "./ActStatusBadge";

interface Props {
  payments: Payment[];
  onSetSent: (paymentId: number, value: boolean) => Promise<void>;
  onSetSigned: (paymentId: number, value: boolean) => Promise<void>;
  onSaveComment: (paymentId: number, comment: string) => Promise<void>;
}

export default function PaymentsTable({
  payments,
  onSetSent,
  onSetSigned,
  onSaveComment,
}: Props) {
  const [pending, setPending] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  async function run(action: () => void | Promise<void>, id: number) {
    setPending(id);
    try {
      await action();
    } finally {
      setPending(null);
    }
  }

  async function saveComment(payment: Payment) {
    await run(() => onSaveComment(payment.id, draft.trim()), payment.id);
    setEditingId(null);
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
            <th className="px-4 py-3">Акт</th>
            <th className="px-4 py-3">Комментарий</th>
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
                  {act ? (
                    <div className="space-y-1">
                      <ActStatusBadge status={act.status} />
                      <div className="text-xs text-slate-500">
                        Отправлен:{" "}
                        {act.is_sent ? (
                          <span className="text-slate-700">
                            {act.sent_at ? formatDate(act.sent_at) : "да"}
                          </span>
                        ) : (
                          "—"
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        Подписан:{" "}
                        {act.is_signed ? (
                          <span className="text-slate-700">
                            {act.signed_at ? formatDate(act.signed_at) : "да"}
                          </span>
                        ) : (
                          "—"
                        )}
                      </div>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="min-w-[200px] px-4 py-3">
                  {editingId === payment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs focus:border-slate-500 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          disabled={busy}
                          onClick={() => saveComment(payment)}
                          className="rounded bg-slate-800 px-2 py-1 text-xs text-white disabled:bg-slate-300"
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      disabled={!act}
                      onClick={() => {
                        setEditingId(payment.id);
                        setDraft(act?.manager_comment ?? "");
                      }}
                      className="w-full text-left text-xs text-slate-600 hover:text-slate-900"
                    >
                      {act?.manager_comment || (
                        <span className="text-slate-400">+ комментарий</span>
                      )}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {act && !act.is_sent && (
                      <button
                        disabled={busy}
                        onClick={() => run(() => onSetSent(payment.id, true), payment.id)}
                        className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-medium text-white disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        Акт отправлен
                      </button>
                    )}
                    {act && act.is_sent && (
                      <button
                        disabled={busy || act.is_signed}
                        title={act.is_signed ? "Сначала снимите подпись" : undefined}
                        onClick={() => run(() => onSetSent(payment.id, false), payment.id)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                      >
                        Отменить отправку
                      </button>
                    )}
                    {act && !act.is_signed && (
                      <button
                        disabled={busy}
                        onClick={() => run(() => onSetSigned(payment.id, true), payment.id)}
                        className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-medium text-white disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        Акт подписан
                      </button>
                    )}
                    {act && act.is_signed && (
                      <button
                        disabled={busy}
                        onClick={() => run(() => onSetSigned(payment.id, false), payment.id)}
                        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:text-slate-300"
                      >
                        Снять подпись
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {payments.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                Нет оплат по выбранным фильтрам
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
