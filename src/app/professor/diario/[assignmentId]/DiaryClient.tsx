"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { weekdayLabel } from "@/lib/teacher";
import { saveLesson, deleteLesson, saveAttendance } from "../actions";

type Header = { classGroup: string; subject: string; teacher: string; schoolYear: string };
type Student = { id: string; name: string; registration: string };
type Schedule = { id: string; weekday: number; startTime: string; endTime: string; lessonNumber: number };
type Lesson = {
  id: string;
  number: number | null;
  date: string | null;
  topic: string;
  content: string | null;
  objective: string | null;
  methodology: string | null;
  activity: string | null;
  bnccCodes: string | null;
  planned: boolean;
};
type Att = { studentId: string; date: string; slot: number; present: boolean };

type Tab = "chamada" | "aula" | "anteriores" | "frequencia";

function jsWeekdayToIso(d: number) {
  // JS: 0=domingo..6=sábado -> ISO 1=segunda..7=domingo
  return d === 0 ? 7 : d;
}

export function DiaryClient({
  assignmentId,
  header,
  students,
  schedules,
  lessons,
  attendances,
}: {
  assignmentId: string;
  header: Header;
  students: Student[];
  schedules: Schedule[];
  lessons: Lesson[];
  attendances: Att[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("chamada");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{header.classGroup}</h2>
        <p className="text-sm text-slate-500">
          {header.subject} · Prof. {header.teacher} · {header.schoolYear}
        </p>
      </div>

      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {[
          { id: "chamada", label: "Chamada" },
          { id: "aula", label: "Registro de aula" },
          { id: "anteriores", label: "Aulas anteriores" },
          { id: "frequencia", label: "Frequência & Médias" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={clsx(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap",
              tab === t.id
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "chamada" && (
        <AttendanceTab
          assignmentId={assignmentId}
          header={header}
          students={students}
          schedules={schedules}
          lessons={lessons}
          attendances={attendances}
          today={today}
          onSaved={() => router.refresh()}
        />
      )}
      {tab === "aula" && (
        <LessonTab assignmentId={assignmentId} lessons={lessons} onSaved={() => router.refresh()} />
      )}
      {tab === "anteriores" && (
        <PreviousLessonsTab assignmentId={assignmentId} lessons={lessons} onChanged={() => router.refresh()} />
      )}
      {tab === "frequencia" && (
        <FrequencyTab students={students} attendances={attendances} />
      )}
    </div>
  );
}

/* ----------------------------- CHAMADA ----------------------------- */
function AttendanceTab({
  assignmentId,
  header,
  students,
  schedules,
  lessons,
  attendances,
  today,
  onSaved,
}: {
  assignmentId: string;
  header: Header;
  students: Student[];
  schedules: Schedule[];
  lessons: Lesson[];
  attendances: Att[];
  today: string;
  onSaved: () => void;
}) {
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState(1);
  const [lessonId, setLessonId] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  const isoWeekday = jsWeekdayToIso(new Date(date + "T00:00:00").getDay());
  // aulas do dia identificadas pelo horário
  const daySchedules = schedules.filter((s) => s.weekday === isoWeekday);

  // presença atual carregada do banco para (date, slot)
  const existing = useMemo(() => {
    const map: Record<string, boolean> = {};
    attendances
      .filter((a) => a.date === date && a.slot === slot)
      .forEach((a) => (map[a.studentId] = a.present));
    return map;
  }, [attendances, date, slot]);

  const [presence, setPresence] = useState<Record<string, boolean>>({});
  // estado efetivo: usa alteração local, senão o existente, senão presente=true
  function isPresent(id: string) {
    if (id in presence) return presence[id];
    if (id in existing) return existing[id];
    return true;
  }
  function toggle(id: string) {
    setPresence((p) => ({ ...p, [id]: !isPresent(id) }));
  }
  function markAll(v: boolean) {
    const all: Record<string, boolean> = {};
    students.forEach((s) => (all[s.id] = v));
    setPresence(all);
  }

  function onSave() {
    setMsg("");
    const full: Record<string, boolean> = {};
    students.forEach((s) => (full[s.id] = isPresent(s.id)));
    startTransition(async () => {
      const res = await saveAttendance(assignmentId, date, slot, full, lessonId || null);
      if (res?.error) setMsg(res.error);
      else {
        setMsg("Chamada salva.");
        setPresence({});
        onSaved();
      }
    });
  }

  const presentCount = students.filter((s) => isPresent(s.id)).length;

  return (
    <div className="space-y-4">
      {/* Cabeçalho da chamada */}
      <div className="card p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-slate-400 text-xs uppercase">Turma</p>
          <p className="font-medium text-slate-800">{header.classGroup}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs uppercase">Disciplina</p>
          <p className="font-medium text-slate-800">{header.subject}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs uppercase">Professor</p>
          <p className="font-medium text-slate-800">{header.teacher}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs uppercase">Dia</p>
          <p className="font-medium text-slate-800">{weekdayLabel(isoWeekday)}</p>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Data</label>
            <input type="date" className="input" value={date} onChange={(e) => { setDate(e.target.value); setPresence({}); }} />
          </div>
          <div>
            <label className="label">Aula de frequência (máx. 2)</label>
            <select className="input" value={slot} onChange={(e) => { setSlot(Number(e.target.value)); setPresence({}); }}>
              <option value={1}>1ª aula</option>
              <option value={2}>2ª aula</option>
            </select>
          </div>
          <div>
            <label className="label">Horário identificado</label>
            <div className="input bg-slate-50">
              {daySchedules.length > 0
                ? daySchedules.map((s) => `${s.lessonNumber}ª (${s.startTime}-${s.endTime})`).join(", ")
                : "Sem horário cadastrado neste dia"}
            </div>
          </div>
        </div>

        <div>
          <label className="label">Vincular a um registro de aula (opcional)</label>
          <select className="input" value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
            <option value="">Não vincular</option>
            {lessons.filter((l) => !l.planned).map((l) => (
              <option key={l.id} value={l.id}>
                {l.date ? `${l.date} · ` : ""}{l.topic}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Presentes: <b>{presentCount}</b> / {students.length}
          </p>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => markAll(true)}>Todos presentes</button>
            <button className="btn-secondary" onClick={() => markAll(false)}>Todos ausentes</button>
          </div>
        </div>

        {students.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum aluno matriculado nesta turma.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Aluno</th>
                  <th>Matrícula</th>
                  <th className="text-center">Presença</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => {
                  const present = isPresent(s.id);
                  return (
                    <tr key={s.id}>
                      <td className="text-slate-400">{i + 1}</td>
                      <td className="font-medium text-slate-800">{s.name}</td>
                      <td>{s.registration}</td>
                      <td className="text-center">
                        <button
                          onClick={() => toggle(s.id)}
                          className={clsx(
                            "badge cursor-pointer",
                            present ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}
                        >
                          {present ? "Presente" : "Falta"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {msg && (
          <p className={clsx("rounded-lg px-3 py-2 text-sm", msg === "Chamada salva." ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
            {msg}
          </p>
        )}
        <div className="flex justify-end">
          <button className="btn-primary" onClick={onSave} disabled={pending || students.length === 0}>
            {pending ? "Salvando..." : "Salvar chamada"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------- REGISTRO DE AULA -------------------------- */
function LessonTab({
  assignmentId,
  lessons,
  onSaved,
}: {
  assignmentId: string;
  lessons: Lesson[];
  onSaved: () => void;
}) {
  const [selectedPlanned, setSelectedPlanned] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  const plannedLessons = lessons.filter((l) => l.planned);
  const prefill = plannedLessons.find((l) => l.id === selectedPlanned);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    setMsg("");
    startTransition(async () => {
      const res = await saveLesson(assignmentId, fd);
      if (res?.error) setMsg(res.error);
      else {
        setMsg("Registro de aula salvo.");
        form.reset();
        setSelectedPlanned("");
        onSaved();
      }
    });
  }

  return (
    <div className="card p-5 space-y-4">
      {plannedLessons.length > 0 && (
        <div>
          <label className="label">Selecionar aula planejada (opcional)</label>
          <select className="input" value={selectedPlanned} onChange={(e) => setSelectedPlanned(e.target.value)}>
            <option value="">Nova aula em branco</option>
            {plannedLessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.number ? `Aula ${l.number} · ` : ""}{l.topic}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Ao selecionar, os campos são preenchidos com o planejamento. O registro é salvo como aula ministrada.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4" key={selectedPlanned}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Número da aula</label>
            <input name="number" type="number" min={1} className="input" defaultValue={prefill?.number ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Data</label>
            <input name="date" type="date" className="input" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>
        </div>
        <div>
          <label className="label">Tema *</label>
          <input name="topic" className="input" defaultValue={prefill?.topic ?? ""} required />
        </div>
        <div>
          <label className="label">Objetivo</label>
          <textarea name="objective" className="input" rows={2} defaultValue={prefill?.objective ?? ""} />
        </div>
        <div>
          <label className="label">Conteúdo</label>
          <textarea name="content" className="input" rows={2} defaultValue={prefill?.content ?? ""} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Metodologia</label>
            <textarea name="methodology" className="input" rows={2} defaultValue={prefill?.methodology ?? ""} />
          </div>
          <div>
            <label className="label">Atividade</label>
            <textarea name="activity" className="input" rows={2} defaultValue={prefill?.activity ?? ""} />
          </div>
        </div>
        <div>
          <label className="label">Habilidades BNCC (códigos separados por vírgula)</label>
          <input name="bnccCodes" className="input" defaultValue={prefill?.bnccCodes ?? ""} placeholder="Ex.: EM13CHS101, EM13CHS102" />
        </div>
        {msg && (
          <p className={clsx("rounded-lg px-3 py-2 text-sm", msg.includes("salvo") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
            {msg}
          </p>
        )}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Salvando..." : "Salvar registro de aula"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* -------------------------- AULAS ANTERIORES -------------------------- */
function PreviousLessonsTab({
  assignmentId,
  lessons,
  onChanged,
}: {
  assignmentId: string;
  lessons: Lesson[];
  onChanged: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const given = lessons.filter((l) => !l.planned);

  function onDelete(id: string) {
    if (!confirm("Excluir este registro de aula?")) return;
    startTransition(async () => {
      await deleteLesson(assignmentId, id);
      onChanged();
    });
  }

  if (given.length === 0) {
    return <div className="card p-8 text-center text-sm text-slate-500">Nenhuma aula registrada ainda.</div>;
  }

  return (
    <div className="space-y-3">
      {given.map((l) => (
        <div key={l.id} className="card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-800">
                {l.number ? `Aula ${l.number} · ` : ""}{l.topic}
              </p>
              <p className="text-xs text-slate-400">{l.date ?? "Sem data"}</p>
            </div>
            <button className="text-red-600 hover:underline text-sm" disabled={pending} onClick={() => onDelete(l.id)}>
              Excluir
            </button>
          </div>
          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {l.objective && <Field label="Objetivo" value={l.objective} />}
            {l.content && <Field label="Conteúdo" value={l.content} />}
            {l.methodology && <Field label="Metodologia" value={l.methodology} />}
            {l.activity && <Field label="Atividade" value={l.activity} />}
            {l.bnccCodes && <Field label="BNCC" value={l.bnccCodes} />}
          </dl>
        </div>
      ))}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-slate-400">{label}</dt>
      <dd className="text-slate-700">{value}</dd>
    </div>
  );
}

/* -------------------------- FREQUÊNCIA & MÉDIAS -------------------------- */
function FrequencyTab({
  students,
  attendances,
}: {
  students: Student[];
  attendances: Att[];
}) {
  const rows = students.map((s) => {
    const recs = attendances.filter((a) => a.studentId === s.id);
    const total = recs.length;
    const present = recs.filter((a) => a.present).length;
    const pct = total > 0 ? Math.round((present / total) * 100) : null;
    return { ...s, total, present, absent: total - present, pct };
  });

  const totalRegistros = attendances.length;

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <p className="text-sm text-slate-500">
          Total de registros de frequência: <b>{totalRegistros}</b>
        </p>
      </div>
      {students.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500">Sem alunos.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Aulas</th>
                <th>Presenças</th>
                <th>Faltas</th>
                <th>Frequência</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium text-slate-800">{r.name}</td>
                  <td>{r.total}</td>
                  <td>{r.present}</td>
                  <td>{r.absent}</td>
                  <td>
                    {r.pct === null ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <span className={clsx("badge", r.pct >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {r.pct}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
