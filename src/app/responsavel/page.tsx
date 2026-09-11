import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function GuardianDashboard() {
  const session = await getSession();
  const guardian = await prisma.guardian.findFirst({
    where: { userId: session?.user?.id },
    include: { students: { include: { classGroup: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          Olá, {session?.user?.name?.split(" ")[0] || "Responsável"}
        </h2>
        <p className="text-sm text-slate-500">Acompanhe os alunos vinculados a você</p>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-slate-800 mb-3">Alunos vinculados</h3>
        {guardian && guardian.students.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {guardian.students.map((s) => (
              <li key={s.id} className="py-3">
                <p className="font-medium text-slate-800">{s.name}</p>
                <p className="text-sm text-slate-500">
                  {s.classGroup?.name ?? "Sem turma"} · Matrícula {s.registration}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Nenhum aluno vinculado.</p>
        )}
      </div>
    </div>
  );
}
