import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const session = await getSession();
  const student = await prisma.student.findFirst({
    where: { userId: session?.user?.id },
    include: { classGroup: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          Olá, {session?.user?.name?.split(" ")[0] || "Aluno(a)"}
        </h2>
        <p className="text-sm text-slate-500">
          {student?.classGroup
            ? `Turma: ${student.classGroup.name} · ${student.classGroup.schoolYear}`
            : "Seu portal do aluno"}
        </p>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-slate-800 mb-2">Seus dados</h3>
        {student ? (
          <dl className="text-sm text-slate-600 space-y-1">
            <div className="flex gap-2">
              <dt className="font-medium w-28">Matrícula:</dt>
              <dd>{student.registration}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium w-28">Turma:</dt>
              <dd>{student.classGroup?.name ?? "Não matriculado"}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-slate-500">Cadastro de aluno não vinculado.</p>
        )}
      </div>
    </div>
  );
}
