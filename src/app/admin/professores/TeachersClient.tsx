"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import {
  inviteTeacher,
  updateTeacher,
  toggleTeacherActive,
  regenerateInvite,
  deleteTeacher,
} from "./actions";

type Teacher = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  accepted: boolean;
  inviteToken: string | null;
  assignments: { id: string; classGroup: string; subject: string }[];
};

export function TeachersClient({ teachers }: { teachers: Teacher[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [error, setError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [pending, startTransition] = useTransition();

  function fullUrl(path: string) {
    if (typeof window === "undefined") return path;
    return window.location.origin + path;
  }

  function openCreate() {
    setEditing(null);
    setError("");
    setInviteUrl("");
    setOpen(true);
  }
  function openEdit(t: Teacher) {
    setEditing(t);
    setError("");
    setInviteUrl("");
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const res = editing
        ? await updateTeacher(editing.userId, fd)
        : await inviteTeacher(fd);
      if (res?.error) setError(res.error);
      else {
        router.refresh();
        if (res?.inviteUrl) {
          setInviteUrl(fullUrl(res.inviteUrl));
        } else {
          setOpen(false);
        }
      }
    });
  }

  function onToggle(t: Teacher) {
    startTransition(async () => {
      await toggleTeacherActive(t.userId);
      router.refresh();
    });
  }

  function onRegenerate(t: Teacher) {
    startTransition(async () => {
      const res = await regenerateInvite(t.userId);
      if (res?.inviteUrl) {
        prompt("Novo link de convite (copie e envie ao professor):", fullUrl(res.inviteUrl));
      }
      router.refresh();
    });
  }

  function onDelete(t: Teacher) {
    if (!confirm(`Excluir o professor "${t.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteTeacher(t.userId);
      if (res?.error) alert(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Professores"
        subtitle="Cadastre, convide e gerencie os professores"
        action={
          <button className="btn-primary" onClick={openCreate}>
            + Convidar professor
          </button>
        }
      />

      {teachers.length === 0 ? (
        <EmptyState message="Nenhum professor cadastrado. Use “Convidar professor” para começar." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Atribuições</th>
                <th>Situação</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium text-slate-800">{t.name}</td>
                  <td>{t.email}</td>
                  <td>
                    {t.assignments.length === 0 ? (
                      <span className="text-slate-400">Nenhuma</span>
                    ) : (
                      <span className="text-slate-600">
                        {t.assignments.length} atribuição(ões)
                      </span>
                    )}
                  </td>
                  <td>
                    {!t.active ? (
                      <span className="badge bg-slate-100 text-slate-600">Inativo</span>
                    ) : t.accepted ? (
                      <span className="badge bg-green-100 text-green-700">Ativo</span>
                    ) : (
                      <span className="badge bg-amber-100 text-amber-700">Convite pendente</span>
                    )}
                  </td>
                  <td className="text-right space-x-2 whitespace-nowrap text-sm">
                    <button className="text-brand-600 hover:underline" onClick={() => openEdit(t)}>
                      Editar
                    </button>
                    {!t.accepted && (
                      <button className="text-amber-600 hover:underline" onClick={() => onRegenerate(t)}>
                        Convite
                      </button>
                    )}
                    <button className="text-slate-600 hover:underline" onClick={() => onToggle(t)}>
                      {t.active ? "Desativar" : "Ativar"}
                    </button>
                    <button className="text-red-600 hover:underline" onClick={() => onDelete(t)}>
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
        title={editing ? "Editar professor" : "Convidar professor"}
      >
        {inviteUrl ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Professor cadastrado! Envie o link de convite abaixo para que ele defina a senha e
              acesse o portal:
            </p>
            <input readOnly className="input" value={inviteUrl} onFocus={(e) => e.target.select()} />
            <div className="flex justify-end gap-2">
              <button
                className="btn-secondary"
                onClick={() => navigator.clipboard?.writeText(inviteUrl)}
              >
                Copiar
              </button>
              <button className="btn-primary" onClick={() => setOpen(false)}>
                Concluir
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Dica: defina as disciplinas e turmas do professor em <b>Turmas → Atribuições</b>.
              Elas aparecerão automaticamente no portal dele após o acesso.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Nome *</label>
              <input name="name" className="input" defaultValue={editing?.name ?? ""} required />
            </div>
            <div>
              <label className="label">E-mail *</label>
              <input
                name="email"
                type="email"
                className="input"
                defaultValue={editing?.email ?? ""}
                required
                disabled={!!editing}
              />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input name="phone" className="input" defaultValue={editing?.phone ?? ""} />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={pending}>
                {pending ? "Salvando..." : editing ? "Salvar" : "Cadastrar e gerar convite"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
