"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { WEEKDAYS, weekdayLabel } from "@/lib/teacher";
import { createSchedule, deleteSchedule } from "./actions";

type Schedule = {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  lessonNumber: number;
  classGroup: string;
  subject: string;
  teacher: string;
};
type AssignmentOption = { id: string; label: string };

export function SchedulesClient({
  schedules,
  assignments,
}: {
  schedules: Schedule[];
  assignments: AssignmentOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const res = await createSchedule(fd);
      if (res?.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  function onDelete(id: string) {
    if (!confirm("Remover este horário?")) return;
    startTransition(async () => {
      await deleteSchedule(id);
      router.refresh();
    });
  }

  const byWeekday = WEEKDAYS.map((w) => ({
    ...w,
    items: schedules.filter((s) => s.weekday === w.value),
  })).filter((w) => w.items.length > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horários"
        subtitle="Grade de aulas vinculada a Turma + Disciplina + Professor. A chamada identifica a aula pelo horário."
        action={
          <button className="btn-primary" onClick={() => { setError(""); setOpen(true); }} disabled={assignments.length === 0}>
            + Novo horário
          </button>
        }
      />

      {assignments.length === 0 && (
        <p className="text-sm text-amber-600">
          Crie atribuições (Turma + Disciplina + Professor) antes de montar a grade de horários.
        </p>
      )}

      {schedules.length === 0 ? (
        <EmptyState message="Nenhum horário cadastrado." />
      ) : (
        <div className="space-y-4">
          {byWeekday.map((w) => (
            <div key={w.value} className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-3">{w.label}</h3>
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Aula nº</th>
                      <th>Horário</th>
                      <th>Turma</th>
                      <th>Disciplina</th>
                      <th>Professor</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {w.items.map((s) => (
                      <tr key={s.id}>
                        <td className="font-medium text-slate-800">{s.lessonNumber}ª</td>
                        <td>{s.startTime} – {s.endTime}</td>
                        <td>{s.classGroup}</td>
                        <td>{s.subject}</td>
                        <td>{s.teacher}</td>
                        <td className="text-right">
                          <button className="text-red-600 hover:underline" onClick={() => onDelete(s.id)}>
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo horário">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Atribuição (Turma + Disciplina + Professor) *</label>
            <select name="assignmentId" className="input" required>
              <option value="">Selecione...</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Dia da semana *</label>
              <select name="weekday" className="input" required defaultValue="1">
                {WEEKDAYS.map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Número da aula *</label>
              <input name="lessonNumber" type="number" min={1} className="input" defaultValue={1} required />
            </div>
            <div>
              <label className="label">Início *</label>
              <input name="startTime" type="time" className="input" required />
            </div>
            <div>
              <label className="label">Fim *</label>
              <input name="endTime" type="time" className="input" required />
            </div>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
