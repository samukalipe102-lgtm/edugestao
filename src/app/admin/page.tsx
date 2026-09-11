import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [students, teachers, classes, subjects, school] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.classGroup.count(),
    prisma.subject.count(),
    prisma.school.findFirst(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          {school?.name ? school.name : "Bem-vindo ao EduGestão"}
        </h2>
        <p className="text-sm text-slate-500">
          Visão geral da gestão escolar
          {school?.schoolYear ? ` · Ano letivo ${school.schoolYear}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Alunos" value={students} icon="🎓" href="/admin/alunos" />
        <StatCard label="Professores" value={teachers} icon="👩‍🏫" href="/admin/professores" />
        <StatCard label="Turmas" value={classes} icon="🏫" href="/admin/turmas" />
        <StatCard label="Disciplinas" value={subjects} icon="📘" href="/admin/disciplinas" />
      </div>

      {!school && (
        <div className="card p-5 border-l-4 border-amber-400">
          <p className="font-medium text-slate-800">Configure sua escola</p>
          <p className="text-sm text-slate-500 mt-1">
            Cadastre as informações da escola em{" "}
            <a href="/admin/configuracoes" className="text-brand-600 font-medium">
              Configurações da Escola
            </a>{" "}
            para que sejam usadas automaticamente nos documentos.
          </p>
        </div>
      )}

      <div className="card p-5">
        <h3 className="font-semibold text-slate-800 mb-2">Primeiros passos</h3>
        <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
          <li>Cadastre as informações da escola em Configurações.</li>
          <li>Cadastre disciplinas e professores (com convite).</li>
          <li>Crie turmas e faça as atribuições (Turma + Disciplina + Professor).</li>
          <li>Matricule alunos nas turmas.</li>
        </ol>
      </div>
    </div>
  );
}
