"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/PageHeader";
import { STUDENT_STATUS_LABELS } from "@/lib/roles";
import {
  createAssignment,
  deleteAssignment,
  enrollStudent,
  unenrollStudent,
} from "../actions";

type Cls = {
  id: string;
  name: string;
  stage: string | null;
  schoolYear: string;
  shift: string | null;
};
type Assignment = { id: string; subject: string; teacher: string };
type Student = { id: string; name: string; registration: string; status: string };
type Option = { id: string; name: string };
type StudentOption = { id: string; name: string; registration: string };

export function ClassDetailClient({
  cls,
  assignments,
  students,
  subjects,
  teachers,
  availableStudents,
}: {
  cls: Cls;
  assignments: Assignment[];
  students: Student[];
  subjects: Option[];
  teachers: Option[];
  availableStudents: StudentOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [assignError, setAssignError] = useState("");
  const [enrollId, setEnrollId] = useState("");

  function onAddAssignment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    setAssignError("");
    startTransition(async () => {
      const res = await createAssignment(cls.id, fd);
      if (res?.error) setAssignError(res.error);
      else {
        form.reset();
        router.refresh();
      }
    });
  }

  function onRemoveAssignment(id: string) {
    if (!confirm("Remover esta atribuição?")) return;
    startTransition(async () => {
      await deleteAssignment(id, cls.id);
      router.refresh();
    });
  }

  function onEnroll() {
    if (!enrollId) return;
    startTransition(async () => {
      await enrollStudent(cls.id, enrollId);
      setEnrollId("");
      router.refresh();
    });
  }

  function onUnenroll(studentId: string) {
    if (!confirm("Desvincular este aluno da turma?")) return;
    startTransition(async () => {
      await unenrollStudent(cls.id, studentId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{cls.name}</h2>
        <p className="text-sm text-slate-500">
          {cls.stage ? `${cls.stage} · ` : ""}
          {cls.schoolYear}
          {cls.shift ? ` · ${cls.shift}` : ""}
        </p>
      </div>

      {/* Atribuições */}
      <section className="card p-5 space-y-4">
        <h3 className="font-semibold text-slate-800">Atribuições (Disciplina + Professor)</h3>
        <p className="text-xs text-slate-500">
          Esta relação controla aulas, BNCC, notas e frequência. O professor verá automaticamente
          estas turmas/disciplinas no portal dele.
        </p>

        {assignments.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma atribuição ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Disciplina</th>
                  <th>Professor</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium text-slate-800">{a.subject}</td>
                    <td>{a.teacher}</td>
                    <td className="text-right">
                      <button className="text-red-600 hover:underline" onClick={() => onRemoveAssignment(a.id)}>
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form onSubmit={onAddAssignment} className="flex flex-col sm:flex-row gap-2 items-start sm:items-end pt-2 border-t border-slate-100">
          <div className="flex-1 w-full">
            <label className="label">Disciplina</label>
            <select name="subjectId" className="input" required>
              <option value="">Selecione...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="label">Professor</label>
            <select name="teacherId" className="input" required>
              <option value="">Selecione...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={pending || subjects.length === 0 || teachers.length === 0}>
            Atribuir
          </button>
        </form>
        {(subjects.length === 0 || teachers.length === 0) && (
          <p className="text-xs text-amber-600">
            Cadastre disciplinas e professores antes de criar atribuições.
          </p>
        )}
        {assignError && <p className="text-sm text-red-600">{assignError}</p>}
      </section>

      {/* Alunos matriculados */}
      <section className="card p-5 space-y-4">
        <h3 className="font-semibold text-slate-800">Alunos matriculados ({students.length})</h3>

        {students.length === 0 ? (
          <EmptyState message="Nenhum aluno matriculado nesta turma." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Matrícula</th>
                  <th>Situação</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium text-slate-800">{s.name}</td>
                    <td>{s.registration}</td>
                    <td>{STUDENT_STATUS_LABELS[s.status] ?? s.status}</td>
                    <td className="text-right">
                      <button className="text-red-600 hover:underline" onClick={() => onUnenroll(s.id)}>
                        Desvincular
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end pt-2 border-t border-slate-100">
          <div className="flex-1 w-full">
            <label className="label">Matricular aluno existente</label>
            <select className="input" value={enrollId} onChange={(e) => setEnrollId(e.target.value)}>
              <option value="">Selecione um aluno sem turma...</option>
              {availableStudents.map((s) => (
                <option key={s.id} value={s.id}>{s.name} · {s.registration}</option>
              ))}
            </select>
          </div>
          <button className="btn-primary" onClick={onEnroll} disabled={pending || !enrollId}>
            Matricular
          </button>
        </div>
        {availableStudents.length === 0 && (
          <p className="text-xs text-slate-400">
            Não há alunos sem turma disponíveis. Cadastre alunos em <b>Alunos</b>.
          </p>
        )}
      </section>
    </div>
  );
}
