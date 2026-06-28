import type { ActStatus } from "../types";

const STATUS_META: Record<ActStatus, { label: string; className: string }> = {
  not_sent: { label: "Не отправлен", className: "bg-slate-200 text-slate-700" },
  waiting_signature: {
    label: "Ждет подписи",
    className: "bg-amber-100 text-amber-800",
  },
  attention_required: {
    label: "Требует внимания",
    className: "bg-red-100 text-red-700",
  },
  closed: { label: "Закрыт", className: "bg-green-100 text-green-700" },
};

export default function ActStatusBadge({ status }: { status: ActStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
