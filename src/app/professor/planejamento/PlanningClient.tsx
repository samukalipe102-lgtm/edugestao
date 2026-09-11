"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import {
  createPlannedLesson,
  deletePlannedLesson,
  savePlan,
  deletePlan,
  importSociologiaLessons,
} from "./actions";

type AssignmentOption = { id: string; label: string };
type PlannedLesson = {
  id: string;
  number: number | null;
  topic: string;
  objective: string | null;
  content: string | null;
  methodology: string | null;
  activity: string | null;
  bnccCodes: string | null;
};
type Plan = {
  id: string;
  title: string;
  description: string | null;
  period: string | null;
  bnccCodes: string | null;
};
type Bncc = { code: string; description: string };

export function PlanningClient({
  assignments,
  selectedId,
  plannedLessons,
  plans,
  bnccSkills,
}: {
  assignments: AssignmentOption[];
  selectedId: string;
  plannedLessons: PlannedLesson[];
  plans: Plan[];
  bnccSkills: Bncc[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [lessonOpen, setLessonOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");

  function changeAssignment(id: string) {
    router.push(`/professor/planejamento?a=${id}`);
  }

  function onCreateLesson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const res = await createPlannedLesson(selectedId, fd);
      if (res?.error) setError(res.error);
      else {
        setLessonOpen(false);
        router.refresh();
      }
    });
  }

  function onDeleteLesson(id: string) {
    if (!confirm("Excluir esta aula planejada?")) return;
    startTransition(async () => {
      await deletePlannedLesson(selectedId, id);
      router.refresh();
    });
  }

  function onSavePlan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const res = await savePlan(selectedId, fd);
      if (res?.error) setError(res.error);
      else {
        setPlanOpen(false);
        router.refresh();
      }
    });
  }

  function onDeletePlan(id: string) {
    if (!confirm("Excluir este plano?")) return;
    startTransition(async () => {
      await deletePlan(selectedId, id);
      router.refresh();
    });
  }

  function onImportSociologia() {
    if (!confirm("Importar as 22 aulas de Sociologia como aulas planejadas nesta turma/disciplina?")) return;
    startTransition(async () => {
      const res = await importSociologiaLessons(selectedId);
      if (res?.error) alert(res.error);
      else {
        alert(`${res?.imported ?? 0} aula(s) importada(s).`);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planejamento"
        subtitle="Planos de ensino, aulas planejadas e habilidades BNCC da disciplina"
      />

      <div className="card p-4">
        <label className="label">Turma / Disciplina</label>
        <select className="input max-w-md" value={selectedId} onChange={(e) => changeAssignment(e.target.value)}>
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habilidades BNCC da disciplina */}
        <div className="card p-5 lg:col-span-1">
          <h3 className="font-semibold text-slate-800 mb-3">Habilidades BNCC</h3>
          {bnccSkills.length === 0 ? (
            <p className="text-sm text-slate-400">
              Nenhuma habilidade vinculada a esta disciplina. O administrador pode vinculá-las em BNCC.
            </p>
          ) : (
            <ul className="space-y-3">
              {bnccSkills.map((s) => (
                <li key={s.code} className="text-sm">
                  <span className="badge bg-brand-50 text-brand-700">{s.code}</span>
                  <p className="text-slate-600 mt-1">{s.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Planos + aulas planejadas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Planos de ensino */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Planos de ensino</h3>
              <button className="btn-secondary" onClick={() => { setEditingPlan(null); setError(""); setPlanOpen(true); }}>
                + Novo plano
              </button>
            </div>
            {plans.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum plano cadastrado.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {plans.map((p) => (
                  <li key={p.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-800">{p.title}</p>
                        {p.period && <p className="text-xs text-slate-400">{p.period}</p>}
                        {p.description && <p className="text-sm text-slate-600 mt-1">{p.description}</p>}
                        {p.bnccCodes && <p className="text-xs text-brand-600 mt-1">BNCC: {p.bnccCodes}</p>}
                      </div>
                      <div className="flex gap-2 text-sm whitespace-nowrap">
                        <button className="text-brand-600 hover:underline" onClick={() => { setEditingPlan(p); setError(""); setPlanOpen(true); }}>Editar</button>
                        <button className="text-red-600 hover:underline" onClick={() => onDeletePlan(p.id)}>Excluir</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Aulas planejadas */}
          <div className="card p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-800">Aulas planejadas ({plannedLessons.length})</h3>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={onImportSociologia} disabled={pending}>
                  Importar 22 aulas de Sociologia
                </button>
                <button className="btn-primary" onClick={() => { setError(""); setLessonOpen(true); }}>
                  + Nova aula
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              As aulas planejadas ficam disponíveis no Diário para o professor selecionar ao registrar a aula ministrada.
            </p>
            {plannedLessons.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma aula planejada.</p>
            ) : (
              <div className="space-y-2">
                {plannedLessons.map((l) => (
                  <div key={l.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-slate-800">
                        {l.number ? `Aula ${l.number} · ` : ""}{l.topic}
                      </p>
                      <button className="text-red-600 hover:underline text-sm" onClick={() => onDeleteLesson(l.id)}>Excluir</button>
                    </div>
                    {l.objective && <p className="text-sm text-slate-600 mt-1"><b>Objetivo:</b> {l.objective}</p>}
                    {l.bnccCodes && <p className="text-xs text-brand-600 mt-1">BNCC: {l.bnccCodes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal aula planejada */}
      <Modal open={lessonOpen} onClose={() => setLessonOpen(false)} title="Nova aula planejada">
        <form onSubmit={onCreateLesson} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Número</label>
              <input name="number" type="number" min={1} className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Tema *</label>
              <input name="topic" className="input" required />
            </div>
          </div>
          <div>
            <label className="label">Objetivo</label>
            <textarea name="objective" className="input" rows={2} />
          </div>
          <div>
            <label className="label">Conteúdo</label>
            <textarea name="content" className="input" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Metodologia</label>
              <textarea name="methodology" className="input" rows={2} />
            </div>
            <div>
              <label className="label">Atividade</label>
              <textarea name="activity" className="input" rows={2} />
            </div>
          </div>
          <div>
            <label className="label">Habilidades BNCC (códigos)</label>
            <input name="bnccCodes" className="input" placeholder="Ex.: EM13CHS101" />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setLessonOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </Modal>

      {/* Modal plano */}
      <Modal open={planOpen} onClose={() => setPlanOpen(false)} title={editingPlan ? "Editar plano" : "Novo plano de ensino"}>
        <form onSubmit={onSavePlan} className="space-y-4">
          {editingPlan && <input type="hidden" name="planId" value={editingPlan.id} />}
          <div>
            <label className="label">Título *</label>
            <input name="title" className="input" defaultValue={editingPlan?.title ?? ""} required />
          </div>
          <div>
            <label className="label">Período</label>
            <input name="period" className="input" defaultValue={editingPlan?.period ?? ""} placeholder="Ex.: 1º Bimestre" />
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea name="description" className="input" rows={3} defaultValue={editingPlan?.description ?? ""} />
          </div>
          <div>
            <label className="label">Habilidades BNCC (códigos)</label>
            <input name="bnccCodes" className="input" defaultValue={editingPlan?.bnccCodes ?? ""} />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setPlanOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
