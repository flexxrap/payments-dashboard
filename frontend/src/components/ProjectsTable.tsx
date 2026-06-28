import type { ProjectListItem } from "../types";
import { formatMoney } from "../format";
import ActStatusBadge from "./ActStatusBadge";

const PROJECT_STATUS_LABEL: Record<string, string> = {
  active: "Активен",
  completed: "Завершен",
  paused: "На паузе",
};

export default function ProjectsTable({ projects }: { projects: ProjectListItem[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Проект</th>
            <th className="px-4 py-3">Клиент</th>
            <th className="px-4 py-3">Сумма оплат</th>
            <th className="px-4 py-3">Оплат</th>
            <th className="px-4 py-3">Закрыто / Открыто</th>
            <th className="px-4 py-3">Статус актов</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium">
                {project.name}
                <span className="ml-2 text-xs text-slate-400">
                  {PROJECT_STATUS_LABEL[project.status] ?? project.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">{project.client_name}</td>
              <td className="px-4 py-3">{formatMoney(project.total_amount)}</td>
              <td className="px-4 py-3">{project.payments_count}</td>
              <td className="px-4 py-3">
                <span className="text-green-600">{project.closed_acts}</span>
                {" / "}
                <span className="text-amber-600">{project.open_acts}</span>
              </td>
              <td className="px-4 py-3">
                <ActStatusBadge status={project.overall_act_status} />
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                Нет проектов
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
