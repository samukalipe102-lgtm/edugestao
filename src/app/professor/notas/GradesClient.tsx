"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { computeAverage, situationLabel } from "@/lib/grades";
import { createAssessment, deleteAssessment, saveGrades } from "./actions";

type AssignmentOption = { id: string; label: string };
type Student = { id: string; name: string; registration: string };
type Assessment = { id: string; name: string; maxValue: number; date: string | null };
type GradeRow = { assessmentId: string; studentId: string; value: number };

export function GradesClient({
  assignments,
  selectedId,
  students,
  assessments,
  grades,
}: {
  assignments: AssignmentOption[];
  selectedId: string;
  students: Student[];
  assessments: Assessment[];
  grades: GradeRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // mapa editável: `${assessmentId}:${studentId}` -> string
  const initial = useMemo(() => {
    const m: Record<string, string> = {};
    grades.forEach((g) => (m[`${g.assessmentId}:${g.studentId}`] = String(g.value)));
    return m;
  }, [grades]);
  const [values, setValues] = useState<Record<string, string>>({});

  function getVal(aId: string, sId: string): string {
    const key = `${aId}:${sId}`;
    if (key in values) return values[key];
    return initial[key] ?? "";
  }
  function setVal(aId: string, sId: string, v: string) {
    setValues((prev) => ({ ...prev, [`${aId}:${sId}`]: v }));
  }

  function changeAssignment(id: string) {
    router.push(`/professor/notas?a=${id}`);
  }

  function onCreateAssessment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const res = await createAssessment(selectedId, fd);
      if (res?.error) setError(res.error);
      else {
        setAssessmentOpen(false);
        router.refresh();
      }
    });
  }

  function onDeleteAssessment(id: string) {
    if (!confirm("Excluir esta avaliação e todas as suas notas?")) return;
    startTransition(async () => {
      await deleteAssessment(selectedId, id);
      router.refresh();
    });
  }

  function onSaveColumn(assessment: Assessment) {
    setMsg("");
    const payload = students.map((s) => {
      const raw = getVal(assessment.id, s.id).trim();
      let value: number | null = null;
      if (raw !== "") {
        const n = Number(raw.replace(",", "."));
        value = Number.isFinite(n) ? n : null;
      }
      return { studentId: s.id, value };
    });
    startTransition(async () => {
      const res = await saveGrades(selectedId, assessment.id, payload);
      if (res?.error) setMsg(res.error);
      else {
        setMsg(`Notas de "${assessment.name}" salvas.`);
        setValues({});
        router.refresh();
      }
    });
  }

  // Médias
  const studentAverages = students.map((s) => {
    const gs = assessments
      .map((a) => {
        const raw = getVal(a.id, s.id).trim();
        if (raw === "") return null;
        const n = Number(raw.replace(",", "."));
        return Number.isFinite(n) ? { value: n, maxValue: a.maxValue } : null;
      })
      .filter((x): x is { value: number; maxValue: number } => x !== null);
    return { studentId: s.id, avg: computeAverage(gs) };
  });

  const classAvg = computeAverage(
    studentAverages
      .filter((s) => s.avg !== null)
      .map((s) => ({ value: s.avg as number, maxValue: 10 }))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notas & Avaliações"
        subtitle="Crie avaliações, lance notas e acompanhe médias e situação"
        action={
          <button className="btn-primary" onClick={() => { setError(""); setAssessmentOpen(true); }}>
            + Nova avaliação
          </button>
        }
      />

      <div className="card p-4">
        <label className="label">Turma / Disciplina</label>
        <select className="input max-w-md" value={selectedId} onChange={(e) => changeAssignment(e.target.value)}>
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </div>

      {msg && (
        <p className={clsx("rounded-lg px-3 py-2 text-sm", msg.includes("salvas") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
          {msg}
        </p>
      )}

      {students.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500">Nenhum aluno matriculado nesta turma.</div>
      ) : assessments.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500">
          Nenhuma avaliação criada. Clique em “Nova avaliação” para começar.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white">Aluno</th>
                {assessments.map((a) => (
                  <th key={a.id} className="text-center min-w-[120px]">
                    <div>{a.name}</div>
                    <div className="text-[10px] font-normal text-slate-400">
                      máx {a.maxValue}{a.date ? ` · ${a.date}` : ""}
                    </div>
                    <div className="flex justify-center gap-2 mt-1">
                      <button className="text-brand-600 hover:underline text-[11px]" disabled={pending} onClick={() => onSaveColumn(a)}>salvar</button>
                      <button className="text-red-600 hover:underline text-[11px]" onClick={() => onDeleteAssessment(a.id)}>excluir</button>
                    </div>
                  </th>
                ))}
                <th className="text-center">Média</th>
                <th className="text-center">Situação</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const avg = studentAverages.find((x) => x.studentId === s.id)?.avg ?? null;
                const sit = situationLabel(avg);
                const toneClass =
                  sit.tone === "green" ? "bg-green-100 text-green-700"
                  : sit.tone === "amber" ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-600";
                return (
                  <tr key={s.id}>
                    <td className="sticky left-0 bg-white font-medium text-slate-800">{s.name}</td>
                    {assessments.map((a) => (
                      <td key={a.id} className="text-center">
                        <input
                          className="input w-20 text-center px-2 py-1"
                          value={getVal(a.id, s.id)}
                          onChange={(e) => setVal(a.id, s.id, e.target.value)}
                          inputMode="decimal"
                          placeholder="—"
                        />
                      </td>
                    ))}
                    <td className="text-center font-semibold text-slate-800">
                      {avg === null ? "—" : avg.toFixed(2)}
                    </td>
                    <td className="text-center">
                      <span className={clsx("badge", toneClass)}>{sit.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50">
                <td className="sticky left-0 bg-slate-50 font-semibold">Média da turma</td>
                <td colSpan={assessments.length}></td>
                <td className="text-center font-bold text-brand-700">
                  {classAvg === null ? "—" : classAvg.toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {assessments.length > 0 && (
        <p className="text-xs text-slate-400">
          Edite as notas nas células e clique em “salvar” no cabeçalho da avaliação. Deixe em branco para remover a nota. As médias são normalizadas para a escala 0–10.
        </p>
      )}

      <Modal open={assessmentOpen} onClose={() => setAssessmentOpen(false)} title="Nova avaliação">
        <form onSubmit={onCreateAssessment} className="space-y-4">
          <div>
            <label className="label">Nome *</label>
            <input name="name" className="input" placeholder="Ex.: Prova 1" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Valor máximo</label>
              <input name="maxValue" type="number" step="0.1" min="0.1" className="input" defaultValue={10} />
            </div>
            <div>
              <label className="label">Data</label>
              <input name="date" type="date" className="input" />
            </div>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setAssessmentOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Salvando..." : "Criar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
