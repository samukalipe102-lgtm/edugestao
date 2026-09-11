"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { STUDENT_STATUS_LABELS } from "@/lib/roles";
import {
  createStudent,
  updateStudent,
  deleteStudent,
  transferStudent,
} from "./actions";

type Student = {
  id: string;
  name: string;
  registration: string;
  email: string | null;
  phone: string | null;
  status: string;
  classGroupId: string | null;
  className: string | null;
  guardianName: string | null;
};
type ClassOption = { id: string; name: string; schoolYear: string };

export function StudentsClient({
  students,
  classes,
}: {
  students: Student[];
  classes: ClassOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [transferring, setTransferring] = useState<Student | null>(null);
  const [transferClass, setTransferClass] = useState("");
  const [markTransferred, setMarkTransferred] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.registration.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditing(null);
    setError("");
    setOpen(true);
  }
  function openEdit(s: Student) {
    setEditing(s);
    setError("");
    setOpen(true);
  }
  function openTransfer(s: Student) {
    setTransferring(s);
    setTransferClass(s.classGroupId ?? "");
    setMarkTransferred(false);
    setTransferOpen(true);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    startTransition(async () => {
      const res = editing ? await updateStudent(editing.id, fd) : await createStudent(fd);
      if (res?.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  function onConfirmTransfer() {
    if (!transferring) return;
    startTransition(async () => {
      await transferStudent(transferring.id, transferClass || null, markTransferred);
      setTransferOpen(false);
      router.refresh();
    });
  }

  function onDelete(s: Student) {
    if (!confirm(`Excluir/remover o aluno "${s.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteStudent(s.id);
      if (res?.error) alert(res.error);
      else router.refresh();
    });
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      TRANSFERRED: "bg-amber-100 text-amber-700",
      INACTIVE: "bg-slate-100 text-slate-600",
    };
    return (
      <span className={`badge ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
        {STUDENT_STATUS_LABELS[status] ?? status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alunos"
        subtitle="Cadastro, matrícula, transferência e situação"
        action={
          <button className="btn-primary" onClick={openCreate}>
            + Novo aluno
          </button>
        }
      />

      <input
        className="input max-w-sm"
        placeholder="Buscar por nome ou matrícula..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <EmptyState message={students.length === 0 ? "Nenhum aluno cadastrado." : "Nenhum aluno encontrado."} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Matrícula</th>
                <th>Turma</th>
                <th>Responsável</th>
                <th>Situação</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium text-slate-800">{s.name}</td>
                  <td>{s.registration}</td>
                  <td>{s.className ?? <span className="text-slate-400">Sem turma</span>}</td>
                  <td>{s.guardianName ?? "—"}</td>
                  <td>{statusBadge(s.status)}</td>
                  <td className="text-right space-x-2 whitespace-nowrap text-sm">
                    <button className="text-brand-600 hover:underline" onClick={() => openEdit(s)}>
                      Editar
                    </button>
                    <button className="text-slate-600 hover:underline" onClick={() => openTransfer(s)}>
                      Transferir
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

      {/* Cadastro / edição */}
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar aluno" : "Novo aluno"}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="label">Nome *</label>
              <input name="name" className="input" defaultValue={editing?.name ?? ""} required />
            </div>
            <div>
              <label className="label">Matrícula *</label>
              <input name="registration" className="input" defaultValue={editing?.registration ?? ""} required />
            </div>
            <div>
              <label className="label">Situação</label>
              <select name="status" className="input" defaultValue={editing?.status ?? "ACTIVE"}>
                <option value="ACTIVE">Ativo</option>
                <option value="TRANSFERRED">Transferido</option>
                <option value="INACTIVE">Inativo</option>
              </select>
            </div>
            <div>
              <label className="label">E-mail</label>
              <input name="email" type="email" className="input" defaultValue={editing?.email ?? ""} />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input name="phone" className="input" defaultValue={editing?.phone ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Turma</label>
              <select name="classGroupId" className="input" defaultValue={editing?.classGroupId ?? ""}>
                <option value="">Sem turma</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} · {c.schoolYear}</option>
                ))}
              </select>
            </div>
          </div>

          {!editing && (
            <div className="rounded-lg bg-slate-50 p-3 space-y-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Responsável (opcional)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input name="guardianName" className="input" placeholder="Nome" />
                <input name="guardianPhone" className="input" placeholder="Telefone" />
                <input name="guardianEmail" className="input" placeholder="E-mail" />
              </div>
            </div>
          )}

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

      {/* Transferência */}
      <Modal open={transferOpen} onClose={() => setTransferOpen(false)} title={`Transferir ${transferring?.name ?? ""}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Nova turma</label>
            <select className="input" value={transferClass} onChange={(e) => setTransferClass(e.target.value)}>
              <option value="">Sem turma (desvincular)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} · {c.schoolYear}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={markTransferred} onChange={(e) => setMarkTransferred(e.target.checked)} />
            Marcar situação como “Transferido”
          </label>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setTransferOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={onConfirmTransfer} disabled={pending}>
              {pending ? "Aplicando..." : "Confirmar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
