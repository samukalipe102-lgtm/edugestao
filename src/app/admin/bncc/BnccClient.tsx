"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { createSkill, updateSkill, deleteSkill, importSociologiaBncc } from "./actions";

type Skill = {
  id: string;
  code: string;
  stage: string | null;
  grade: string | null;
  area: string | null;
  component: string | null;
  description: string;
  subjectId: string | null;
  subjectName: string | null;
};
type SubjectOption = { id: string; name: string };

export function BnccClient({
  skills,
  subjects,
}: {
  skills: Skill[];
  subjects: SubjectOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [importSubject, setImportSubject] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = skills.filter(
    (s) =>
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      (s.component ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditing(null);
    setError("");
    setOpen(true);
  }
  function openEdit(s: Skill) {
    setEditing(s);
    setError("");
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const res = editing ? await updateSkill(editing.id, fd) : await createSkill(fd);
      if (res?.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  function onDelete(s: Skill) {
    if (!confirm(`Excluir a habilidade ${s.code}?`)) return;
    startTransition(async () => {
      await deleteSkill(s.id);
      router.refresh();
    });
  }

  function onImport() {
    startTransition(async () => {
      const res = await importSociologiaBncc(importSubject || undefined);
      if (res?.error) alert(res.error);
      else {
        alert(`Importação concluída. ${res?.imported ?? 0} nova(s) habilidade(s) adicionada(s).`);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="BNCC"
        subtitle="Banco de habilidades por etapa, série, área, componente, código e descrição"
        action={
          <button className="btn-primary" onClick={openCreate}>
            + Nova habilidade
          </button>
        }
      />

      {/* Importação de Sociologia */}
      <div className="card p-5 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label className="label">Importar habilidades de Sociologia (Ensino Médio)</label>
          <select className="input" value={importSubject} onChange={(e) => setImportSubject(e.target.value)}>
            <option value="">Não vincular a disciplina</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>Vincular a: {s.name}</option>
            ))}
          </select>
        </div>
        <button className="btn-secondary" onClick={onImport} disabled={pending}>
          Importar Sociologia
        </button>
      </div>

      <input
        className="input max-w-sm"
        placeholder="Buscar por código, descrição ou componente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <EmptyState message={skills.length === 0 ? "Nenhuma habilidade cadastrada. Cadastre ou importe as de Sociologia." : "Nenhum resultado."} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Código</th>
                <th>Componente</th>
                <th>Descrição</th>
                <th>Disciplina</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium text-slate-800 whitespace-nowrap">{s.code}</td>
                  <td className="whitespace-nowrap">{s.component ?? "—"}</td>
                  <td className="max-w-md">{s.description}</td>
                  <td className="whitespace-nowrap">{s.subjectName ?? "—"}</td>
                  <td className="text-right space-x-2 whitespace-nowrap text-sm">
                    <button className="text-brand-600 hover:underline" onClick={() => openEdit(s)}>
                      Editar
                    </button>
                    <button className="text-red-600 hover:underline" onClick={() => onDelete(s)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar habilidade" : "Nova habilidade BNCC"}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Código *</label>
              <input name="code" className="input" defaultValue={editing?.code ?? ""} required disabled={!!editing} />
            </div>
            <div>
              <label className="label">Componente</label>
              <input name="component" className="input" defaultValue={editing?.component ?? ""} placeholder="Ex.: Sociologia" />
            </div>
            <div>
              <label className="label">Etapa</label>
              <input name="stage" className="input" defaultValue={editing?.stage ?? ""} placeholder="Ex.: Ensino Médio" />
            </div>
            <div>
              <label className="label">Série</label>
              <input name="grade" className="input" defaultValue={editing?.grade ?? ""} />
            </div>
            <div className="col-span-2">
              <label className="label">Área</label>
              <input name="area" className="input" defaultValue={editing?.area ?? ""} placeholder="Ex.: Ciências Humanas e Sociais Aplicadas" />
            </div>
            <div className="col-span-2">
              <label className="label">Disciplina</label>
              <select name="subjectId" className="input" defaultValue={editing?.subjectId ?? ""}>
                <option value="">Não vincular</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Descrição *</label>
            <textarea name="description" className="input" rows={3} defaultValue={editing?.description ?? ""} required />
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
