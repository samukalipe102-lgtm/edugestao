"use client";

import { useState } from "react";

type ClassOption = { id: string; name: string; schoolYear: string };
type Student = { id: string; name: string; registration: string; className: string | null };

export function ReportsClient({
  classes,
  students,
}: {
  classes: ClassOption[];
  students: Student[];
}) {
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [search, setSearch] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.registration.toLowerCase().includes(search.toLowerCase())
  );

  function openClassReport(type: string) {
    if (!classId) return alert("Selecione uma turma.");
    window.open(`/relatorios/${type}/${classId}`, "_blank");
  }
  function openStudentReport() {
    if (!studentId) return alert("Selecione um aluno.");
    window.open(`/relatorios/individual/${studentId}`, "_blank");
  }

  return (
    <div className="space-y-6">
      {/* Relatórios por turma */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-slate-800">Relatórios por turma</h3>
        <div>
          <label className="label">Turma</label>
          <select className="input max-w-md" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Selecione...</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} · {c.schoolYear}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => openClassReport("turma")}>Relatório por Turma</button>
          <button className="btn-secondary" onClick={() => openClassReport("notas")}>Relatório de Notas</button>
          <button className="btn-secondary" onClick={() => openClassReport("frequencia")}>Relatório de Frequência</button>
        </div>
      </div>

      {/* Relatório individual */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-slate-800">Relatório individual</h3>
        <input
          className="input max-w-sm"
          placeholder="Buscar aluno..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div>
          <label className="label">Aluno</label>
          <select className="input max-w-md" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">Selecione...</option>
            {filtered.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.registration}{s.className ? ` · ${s.className}` : ""}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-secondary" onClick={openStudentReport}>Relatório Individual</button>
      </div>
    </div>
  );
}
