"use client";

import { useState } from "react";

type Student = { id: string; name: string; registration: string; className: string | null };
type ClassOption = { id: string; name: string; schoolYear: string };

const STUDENT_DOCS = [
  { key: "boletim", label: "Boletim", icon: "📊", desc: "Notas, médias e situação por disciplina." },
  { key: "historico", label: "Histórico Escolar", icon: "📜", desc: "Desempenho consolidado do aluno." },
  { key: "declaracao", label: "Declaração", icon: "📝", desc: "Declaração de matrícula/frequência." },
  { key: "ficha", label: "Ficha Individual", icon: "🗂️", desc: "Dados cadastrais e acadêmicos." },
];

export function DocumentsClient({
  students,
  classes,
}: {
  students: Student[];
  classes: ClassOption[];
}) {
  const [studentId, setStudentId] = useState("");
  const [search, setSearch] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.registration.toLowerCase().includes(search.toLowerCase())
  );

  function open(type: string) {
    if (!studentId) {
      alert("Selecione um aluno primeiro.");
      return;
    }
    window.open(`/documentos/${type}/${studentId}`, "_blank");
  }

  return (
    <div className="space-y-6">
      {/* Documentos por aluno */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-slate-800">Documentos do aluno</h3>
        <input
          className="input max-w-sm"
          placeholder="Buscar aluno por nome ou matrícula..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div>
          <label className="label">Aluno</label>
          <select className="input max-w-md" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">Selecione...</option>
            {filtered.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.registration}
                {s.className ? ` · ${s.className}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STUDENT_DOCS.map((d) => (
            <button
              key={d.key}
              onClick={() => open(d.key)}
              className="card p-4 text-left hover:shadow-md hover:border-brand-300 transition"
            >
              <div className="text-2xl">{d.icon}</div>
              <p className="font-medium text-slate-800 mt-1">{d.label}</p>
              <p className="text-xs text-slate-500 mt-1">{d.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Documentos/relatórios por turma */}
      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-slate-800">Relatórios por turma</h3>
        <p className="text-sm text-slate-500">
          Relatórios consolidados também estão disponíveis em{" "}
          <a href="/admin/relatorios" className="text-brand-600">Relatórios</a>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {classes.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma turma cadastrada.</p>
          ) : (
            classes.map((c) => (
              <a
                key={c.id}
                href={`/relatorios/turma/${c.id}`}
                target="_blank"
                className="card p-4 hover:shadow-md hover:border-brand-300 transition"
              >
                <p className="font-medium text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-500">{c.schoolYear} · Relatório por turma</p>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
