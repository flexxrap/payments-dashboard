import type {
  ActStatus,
  Client,
  PaymentFilters,
  ProjectListItem,
} from "../types";

interface Props {
  clients: Client[];
  projects: ProjectListItem[];
  stages: string[];
  filters: PaymentFilters;
  onChange: (filters: PaymentFilters) => void;
}

const ACT_STATUS_OPTIONS: { value: ActStatus; label: string }[] = [
  { value: "not_sent", label: "Не отправлен" },
  { value: "waiting_signature", label: "Ждет подписи" },
  { value: "attention_required", label: "Требует внимания" },
  { value: "closed", label: "Закрыт" },
];

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none";

export default function Filters({
  clients,
  projects,
  stages,
  filters,
  onChange,
}: Props) {
  function update(patch: Partial<PaymentFilters>) {
    onChange({ ...filters, ...patch });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <input
        type="text"
        placeholder="Поиск по назначению или клиенту"
        value={filters.search ?? ""}
        onChange={(e) => update({ search: e.target.value || undefined })}
        className={`${selectClass} min-w-[220px] flex-1`}
      />

      <select
        value={filters.project_id ?? ""}
        onChange={(e) =>
          update({ project_id: e.target.value ? Number(e.target.value) : undefined })
        }
        className={selectClass}
      >
        <option value="">Все проекты</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        value={filters.client_id ?? ""}
        onChange={(e) =>
          update({ client_id: e.target.value ? Number(e.target.value) : undefined })
        }
        className={selectClass}
      >
        <option value="">Все клиенты</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={filters.act_status ?? ""}
        onChange={(e) =>
          update({ act_status: (e.target.value as ActStatus) || undefined })
        }
        className={selectClass}
      >
        <option value="">Все статусы актов</option>
        {ACT_STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={filters.service_stage ?? ""}
        onChange={(e) => update({ service_stage: e.target.value || undefined })}
        className={selectClass}
      >
        <option value="">Все этапы</option>
        {stages.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-1 text-sm text-slate-500">
        с
        <input
          type="date"
          value={filters.date_from ?? ""}
          onChange={(e) => update({ date_from: e.target.value || undefined })}
          className={selectClass}
        />
      </label>
      <label className="flex items-center gap-1 text-sm text-slate-500">
        по
        <input
          type="date"
          value={filters.date_to ?? ""}
          onChange={(e) => update({ date_to: e.target.value || undefined })}
          className={selectClass}
        />
      </label>

      <button
        onClick={() => onChange({})}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
      >
        Сбросить
      </button>
    </div>
  );
}
