"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { createClass, updateClass, deleteClass } from "./actions";

type ClassGroup = {
  id: string;
  name: string;
  stage: string | null;
  schoolYear: string;
  shift: string | null;
  _count: { students: number; assignments: number };
};

export function ClassesClient({ classes }: { classes: ClassGroup[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClassGroup | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setError("");
    setOpen(true);
  }
  function openEdit(c: ClassGroup) {
    setEditing(c);
    setError("");
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const res = editing ? await updateClass(editing.id, fd) : await createClass(fd);
      if (res?.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
        if (!editing && res?.id) router.push(`/admin/turmas/${res.id}`);
      }
    });
  }

  function onDelete(c: ClassGroup) {
    if (!confirm(`Excluir a turma "${c.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteClass(c.id);
      if (res?.error) alert(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Turmas"
        subtitle="Crie turmas e gerencie atribuições (Turma + Disciplina + Professor) e matrículas"
        action={
          <button className="btn-primary" onClick={openCreate}>
            + Nova turma
          </button>
        }
      />

      {classes.length === 0 ? (
        <EmptyState message="Nenhuma turma cadastrada. Crie a primeira turma." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <div key={c.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/admin/turmas/${c.id}`} className="font-semibold text-slate-800 hover:text-brand-600">
                    {c.name}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {c.stage ? `${c.stage} · ` : ""}
                    {c.schoolYear}
                    {c.shift ? ` · ${c.shift}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-slate-500">
                <span>🎓 {c._count.students} alunos</span>
                <span>🗂️ {c._count.assignments} atribuições</span>
              </div>
              <div className="flex gap-2 pt-1 text-sm">
                <Link href={`/admin/turmas/${c.id}`} className="text-brand-600 hover:underline">
                  Abrir
                </Link>
                <button className="text-slate-600 hover:underline" onClick={() => openEdit(c)}>
                  Editar
                </button>
                <button className="text-red-600 hover:underline" onClick={() => onDelete(c)}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar turma" : "Nova turma"}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Nome *</label>
            <input name="name" className="input" defaultValue={editing?.name ?? ""} placeholder="Ex.: 1º Ano A" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Série / Etapa</label>
              <input name="stage" className="input" defaultValue={editing?.stage ?? ""} placeholder="Ex.: Ensino Médio" />
            </div>
            <div>
              <label className="label">Ano letivo *</label>
              <input name="schoolYear" className="input" defaultValue={editing?.schoolYear ?? ""} placeholder="Ex.: 2026" required />
            </div>
          </div>
          <div>
            <label className="label">Turno</label>
            <select name="shift" className="input" defaultValue={editing?.shift ?? ""}>
              <option value="">—</option>
              <option value="Matutino">Matutino</option>
              <option value="Vespertino">Vespertino</option>
              <option value="Noturno">Noturno</option>
              <option value="Integral">Integral</option>
            </select>
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
