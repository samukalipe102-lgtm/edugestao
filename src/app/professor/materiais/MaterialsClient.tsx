"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { createMaterial, deleteMaterial } from "./actions";

type AssignmentOption = { id: string; label: string };
type Material = { id: string; title: string; url: string | null; description: string | null };

export function MaterialsClient({
  assignments,
  selectedId,
  materials,
}: {
  assignments: AssignmentOption[];
  selectedId: string;
  materials: Material[];
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
      const res = await createMaterial(selectedId, fd);
      if (res?.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  function onDelete(id: string) {
    if (!confirm("Excluir este material?")) return;
    startTransition(async () => {
      await deleteMaterial(selectedId, id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materiais"
        subtitle="Arquivos e links de apoio por turma/disciplina"
        action={<button className="btn-primary" onClick={() => { setError(""); setOpen(true); }}>+ Novo material</button>}
      />

      <div className="card p-4">
        <label className="label">Turma / Disciplina</label>
        <select className="input max-w-md" value={selectedId} onChange={(e) => router.push(`/professor/materiais?a=${e.target.value}`)}>
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </div>

      {materials.length === 0 ? (
        <EmptyState message="Nenhum material cadastrado para esta turma/disciplina." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((m) => (
            <div key={m.id} className="card p-5 flex flex-col gap-2">
              <p className="font-medium text-slate-800">{m.title}</p>
              {m.description && <p className="text-sm text-slate-500">{m.description}</p>}
              <div className="flex items-center justify-between mt-2">
                {m.url ? (
                  <a href={m.url} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">
                    Abrir link →
                  </a>
                ) : <span />}
                <button className="text-red-600 hover:underline text-sm" onClick={() => onDelete(m.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo material">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Título *</label>
            <input name="title" className="input" required />
          </div>
          <div>
            <label className="label">Link (URL)</label>
            <input name="url" type="url" className="input" placeholder="https://..." />
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea name="description" className="input" rows={2} />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
