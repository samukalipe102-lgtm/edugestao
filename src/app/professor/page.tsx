import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { StatCard } from "@/components/StatCard";
import { weekdayLabel } from "@/lib/teacher";

export const dynamic = "force-dynamic";

export default async function TeacherDashboard() {
  const session = await getSession();
  const teacher = await prisma.teacher.findFirst({
    where: { userId: session?.user?.id },
    include: {
      assignments: {
        include: {
          classGroup: true,
          subject: true,
          schedules: true,
        },
      },
    },
  });

  const assignments = teacher?.assignments ?? [];
  const classIds = new Set(assignments.map((a) => a.classGroupId));
  const subjectIds = new Set(assignments.map((a) => a.subjectId));

  // Próximas aulas da semana (a partir de hoje) com base nos horários
  const jsDay = new Date().getDay();
  const todayIso = jsDay === 0 ? 7 : jsDay;
  const upcoming = assignments
    .flatMap((a) =>
      a.schedules.map((s) => ({
        assignmentId: a.id,
        classGroup: a.classGroup.name,
        subject: a.subject.name,
        weekday: s.weekday,
        startTime: s.startTime,
        endTime: s.endTime,
        lessonNumber: s.lessonNumber,
      }))
    )
    .sort((a, b) => {
      const da = (a.weekday - todayIso + 7) % 7;
      const db = (b.weekday - todayIso + 7) % 7;
      if (da !== db) return da - db;
      return a.startTime.localeCompare(b.startTime);
    })
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          Olá, {session?.user?.name?.split(" ")[0] || "Professor(a)"}
        </h2>
        <p className="text-sm text-slate-500">Seu portal de turmas e diário de classe</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Minhas Turmas" value={classIds.size} icon="🏫" href="/professor/turmas" />
        <StatCard label="Minhas Disciplinas" value={subjectIds.size} icon="📘" />
        <StatCard label="Atribuições" value={assignments.length} icon="🗂️" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Próximas aulas</h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-500">
              Sem horários cadastrados. O administrador define a grade em Horários.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((u, i) => (
                <li key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">
                      {u.classGroup} · {u.subject}
                    </p>
                    <p className="text-sm text-slate-500">
                      {weekdayLabel(u.weekday)} · {u.startTime}–{u.endTime} · {u.lessonNumber}ª aula
                    </p>
                  </div>
                  <Link href={`/professor/diario/${u.assignmentId}`} className="text-sm text-brand-600 hover:underline">
                    Diário →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Minhas atribuições</h3>
          {assignments.length === 0 ? (
            <p className="text-sm text-slate-500">
              Você ainda não possui turmas ou disciplinas atribuídas.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {assignments.map((a) => (
                <li key={a.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{a.classGroup.name}</p>
                    <p className="text-sm text-slate-500">{a.subject.name}</p>
                  </div>
                  <Link href={`/professor/diario/${a.id}`} className="text-sm text-brand-600 hover:underline">
                    Abrir →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
