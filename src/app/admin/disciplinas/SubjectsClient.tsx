"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { createSubject, updateSubject, deleteSubject } from "./actions";

type Subject = {
  id: string;
  name: string;
  code: string | null;
  area: string | null;
  _count: { assignments: number };
};

export function SubjectsClient({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setError("");
    setOpen(true);
  }
  function openEdit(s: Subject) {
    setEditing(s);
    setError("");
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const res = editing ? await updateSubject(editing.id, fd) : await createSubject(fd);
      if (res?.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  function onDelete(s: Subject) {
    if (!confirm(`Excluir a disciplina "${s.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteSubject(s.id);
      if (res?.error) alert(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disciplinas"
        subtitle="Componentes curriculares oferecidos pela escola"
        action={
          <button className="btn-primary" onClick={openCreate}>
            + Nova disciplina
          </button>
        }
      />

      {subjects.length === 0 ? (
        <EmptyState message="Nenhuma disciplina cadastrada. Comece criando a primeira." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Código</th>
                <th>Área</th>
                <th>Atribuições</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium text-slate-800">{s.name}</td>
                  <td>{s.code ?? "—"}</td>
                  <td>{s.area ?? "—"}</td>
                  <td>{s._count.assignments}</td>
                  <td className="text-right space-x-2 whitespace-nowrap">
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar disciplina" : "Nova disciplina"}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Nome *</label>
            <input name="name" className="input" defaultValue={editing?.name ?? ""} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Código</label>
              <input name="code" className="input" defaultValue={editing?.code ?? ""} />
            </div>
            <div>
              <label className="label">Área</label>
              <input name="area" className="input" defaultValue={editing?.area ?? ""} placeholder="Ex.: Ciências Humanas" />
            </div>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
