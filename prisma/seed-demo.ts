// Seed OPCIONAL de demonstração.
// Popula a escola, uma turma, disciplinas, um professor, alunos, BNCC, notas,
// frequência, aula e material — útil para explorar o sistema já preenchido.
// Rode com: npm run db:seed:demo
//
// ATENÇÃO: este script LIMPA todos os dados exceto o administrador antes de recriar
// o cenário de demonstração. Não use em produção com dados reais.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const p = new PrismaClient();

async function main() {
  // limpa dados (mantém o admin)
  await p.material.deleteMany({});
  await p.grade.deleteMany({});
  await p.assessment.deleteMany({});
  await p.attendance.deleteMany({});
  await p.schedule.deleteMany({});
  await p.lesson.deleteMany({});
  await p.plan.deleteMany({});
  await p.assignment.deleteMany({});
  await p.student.deleteMany({});
  await p.classGroup.deleteMany({});
  await p.subject.deleteMany({});
  await p.guardian.deleteMany({});
  await p.bnccSkill.deleteMany({});
  await p.user.deleteMany({ where: { role: { not: "ADMIN" } } });
  await p.teacher.deleteMany({});
  await p.school.deleteMany({});

  await p.school.create({
    data: {
      name: "Escola Estadual Exemplo",
      code: "35012345",
      state: "SP",
      educationSecretary: "Secretaria de Estado da Educação",
      municipality: "São Paulo",
      address: "Av. das Nações, 1000 - Centro",
      contact: "(11) 3000-0000 · contato@escolaexemplo.edu.br",
      schoolYear: "2026",
      directorName: "Maria Oliveira",
      secretaryName: "João Pereira",
    },
  });

  const hash = await bcrypt.hash("teste123", 10);

  const socio = await p.subject.create({ data: { name: "Sociologia", area: "Ciências Humanas" } });
  const hist = await p.subject.create({ data: { name: "História", area: "Ciências Humanas" } });
  await p.subject.create({ data: { name: "Língua Portuguesa", area: "Linguagens" } });

  const profUser = await p.user.create({
    data: {
      name: "Carlos Souza",
      email: "professor@escolaexemplo.edu.br",
      role: "TEACHER",
      passwordHash: hash,
      acceptedAt: new Date(),
      teacher: { create: { phone: "(11) 99999-0000" } },
    },
    include: { teacher: true },
  });

  const turma = await p.classGroup.create({
    data: { name: "1º Ano A", stage: "Ensino Médio", schoolYear: "2026", shift: "Matutino" },
  });

  const assign = await p.assignment.create({
    data: { classGroupId: turma.id, subjectId: socio.id, teacherId: profUser.teacher!.id },
  });
  await p.assignment.create({
    data: { classGroupId: turma.id, subjectId: hist.id, teacherId: profUser.teacher!.id },
  });

  await p.schedule.create({ data: { assignmentId: assign.id, weekday: 2, startTime: "07:30", endTime: "08:20", lessonNumber: 1 } });
  await p.schedule.create({ data: { assignmentId: assign.id, weekday: 4, startTime: "09:20", endTime: "10:10", lessonNumber: 3 } });

  const nomes = ["Ana Clara Lima", "Bruno Alves", "Carla Mendes", "Diego Santos", "Eduarda Rocha"];
  const alunos = [] as { id: string }[];
  for (let i = 0; i < nomes.length; i++) {
    const st = await p.student.create({
      data: { name: nomes[i], registration: `2026${String(i + 1).padStart(3, "0")}`, classGroupId: turma.id, status: "ACTIVE" },
    });
    alunos.push(st);
  }
  const aluUser = await p.user.create({ data: { name: nomes[0], email: "aluno@escolaexemplo.edu.br", role: "STUDENT", passwordHash: hash } });
  await p.student.update({ where: { id: alunos[0].id }, data: { userId: aluUser.id, email: "aluno@escolaexemplo.edu.br" } });

  const bncc = [
    { code: "EM13CHS101", description: "Identificar e comparar diferentes fontes e narrativas sobre um fenômeno social." },
    { code: "EM13CHS106", description: "Utilizar categorias das ciências sociais na análise de estruturas e relações sociais." },
    { code: "EM13CHS502", description: "Analisar situações da vida cotidiana à luz de valores, direitos humanos e cidadania." },
  ];
  for (const b of bncc) {
    await p.bnccSkill.create({
      data: { code: b.code, description: b.description, stage: "Ensino Médio", area: "Ciências Humanas e Sociais Aplicadas", component: "Sociologia", subjectId: socio.id },
    });
  }

  const prova = await p.assessment.create({ data: { assignmentId: assign.id, name: "Prova 1", maxValue: 10, date: new Date("2026-09-02") } });
  const trab = await p.assessment.create({ data: { assignmentId: assign.id, name: "Trabalho", maxValue: 10, date: new Date("2026-09-05") } });
  const notas = [[8.5, 9], [6, 5.5], [9, 8], [4, 6], [7.5, 7]];
  for (let i = 0; i < alunos.length; i++) {
    await p.grade.create({ data: { assessmentId: prova.id, studentId: alunos[i].id, assignmentId: assign.id, value: notas[i][0] } });
    await p.grade.create({ data: { assessmentId: trab.id, studentId: alunos[i].id, assignmentId: assign.id, value: notas[i][1] } });
  }

  for (const d of ["2026-09-01", "2026-09-08"]) {
    const date = new Date(d + "T00:00:00");
    for (let i = 0; i < alunos.length; i++) {
      await p.attendance.create({ data: { assignmentId: assign.id, studentId: alunos[i].id, date, slot: 1, present: !(i === 3 && d === "2026-09-08") } });
    }
  }

  await p.lesson.create({
    data: {
      assignmentId: assign.id, teacherId: profUser.teacher!.id, number: 1, date: new Date("2026-09-01"),
      topic: "O que é Sociologia?", objective: "Compreender o objeto da Sociologia.", content: "Origem e olhar sociológico.",
      methodology: "Aula dialogada.", activity: "Observação do cotidiano.", bnccCodes: "EM13CHS101, EM13CHS106", planned: false,
    },
  });

  await p.material.create({
    data: { assignmentId: assign.id, title: "Slides - Introdução à Sociologia", url: "https://exemplo.com/slides.pdf", description: "Material da primeira aula." },
  });

  console.log("=== EduGestão: dados de demonstração criados ===");
  console.log("Admin:      admin@edugestao.local / admin123");
  console.log("Professor:  professor@escolaexemplo.edu.br / teste123");
  console.log("Aluno:      aluno@escolaexemplo.edu.br / teste123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await p.$disconnect();
  });
