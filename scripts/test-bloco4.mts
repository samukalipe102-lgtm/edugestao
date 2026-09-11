// Teste funcional do Bloco 4: BNCC, aulas planejadas, avaliações, notas, médias/situação.
import { PrismaClient } from "@prisma/client";
import socio from "../src/lib/sociologia";
import gradesLib from "../src/lib/grades";
const { SOCIOLOGIA_BNCC, SOCIOLOGIA_AULAS } = socio as any;
const { computeAverage, situationLabel } = gradesLib as any;

const prisma = new PrismaClient();
let failures = 0;
function check(cond, msg) {
  console.log(`${cond ? "✅" : "❌"} ${msg}`);
  if (!cond) failures++;
}

async function cleanup() {
  await prisma.grade.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.plan.deleteMany({});
  await prisma.bnccSkill.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.classGroup.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.user.deleteMany({ where: { role: "TEACHER" } });
  await prisma.teacher.deleteMany({});
}

async function main() {
  await cleanup();

  const subject = await prisma.subject.create({ data: { name: "Sociologia" } });

  // 1. Importar BNCC de Sociologia vinculado à disciplina
  for (const s of SOCIOLOGIA_BNCC) {
    await prisma.bnccSkill.create({ data: { code: s.code, stage: s.stage, area: s.area, component: s.component, description: s.description, subjectId: subject.id } });
  }
  const bnccCount = await prisma.bnccSkill.count({ where: { subjectId: subject.id } });
  check(bnccCount === SOCIOLOGIA_BNCC.length, `BNCC de Sociologia importada (${bnccCount} habilidades)`);

  const teacherUser = await prisma.user.create({
    data: { name: "Prof S", email: "profs@escola.edu", role: "TEACHER", teacher: { create: {} } },
    include: { teacher: true },
  });
  const cls = await prisma.classGroup.create({ data: { name: "1º SA (demo)", schoolYear: "2026" } });
  const assignment = await prisma.assignment.create({
    data: { classGroupId: cls.id, subjectId: subject.id, teacherId: teacherUser.teacher.id },
  });

  // 2. Importar 22 aulas planejadas de Sociologia
  for (const a of SOCIOLOGIA_AULAS) {
    await prisma.lesson.create({
      data: { assignmentId: assignment.id, teacherId: teacherUser.teacher.id, number: a.number, topic: a.topic, objective: a.objective, content: a.content, methodology: a.methodology, activity: a.activity, bnccCodes: a.bnccCodes, planned: true },
    });
  }
  const planned = await prisma.lesson.count({ where: { assignmentId: assignment.id, planned: true } });
  check(planned === 22, `22 aulas planejadas de Sociologia importadas (${planned})`);

  // cada aula tem tema, objetivo, conteúdo, metodologia, atividade, BNCC
  const sample = await prisma.lesson.findFirst({ where: { assignmentId: assignment.id, number: 1 } });
  check(!!(sample.topic && sample.objective && sample.content && sample.methodology && sample.activity && sample.bnccCodes), "Cada aula possui tema/objetivo/conteúdo/metodologia/atividade/BNCC");

  // 3. Alunos
  const [a1, a2] = await Promise.all([
    prisma.student.create({ data: { name: "Ana", registration: "S1", classGroupId: cls.id } }),
    prisma.student.create({ data: { name: "Bruno", registration: "S2", classGroupId: cls.id } }),
  ]);

  // 4. Avaliações
  const prova = await prisma.assessment.create({ data: { assignmentId: assignment.id, name: "Prova 1", maxValue: 10 } });
  const trab = await prisma.assessment.create({ data: { assignmentId: assignment.id, name: "Trabalho", maxValue: 5 } });

  // 5. Notas: Ana 8 e 5(de 5)=10 -> média (8+10)/2 = 9 (aprovada); Bruno 4 e 2(de5)=4 -> (4+4)/2=4 (recuperação)
  await prisma.grade.create({ data: { assessmentId: prova.id, studentId: a1.id, assignmentId: assignment.id, value: 8 } });
  await prisma.grade.create({ data: { assessmentId: trab.id, studentId: a1.id, assignmentId: assignment.id, value: 5 } });
  await prisma.grade.create({ data: { assessmentId: prova.id, studentId: a2.id, assignmentId: assignment.id, value: 4 } });
  await prisma.grade.create({ data: { assessmentId: trab.id, studentId: a2.id, assignmentId: assignment.id, value: 2 } });

  const anaAvg = computeAverage([{ value: 8, maxValue: 10 }, { value: 5, maxValue: 5 }]);
  const brunoAvg = computeAverage([{ value: 4, maxValue: 10 }, { value: 2, maxValue: 5 }]);
  check(anaAvg === 9, `Média normalizada da Ana = 9 (obtido ${anaAvg})`);
  check(brunoAvg === 4, `Média normalizada do Bruno = 4 (obtido ${brunoAvg})`);
  check(situationLabel(anaAvg).label === "Aprovado", "Situação Ana = Aprovado");
  check(situationLabel(brunoAvg).label === "Em recuperação", "Situação Bruno = Em recuperação");

  // 6. Média da turma = (9 + 4)/2 = 6.5
  const classAvg = computeAverage([{ value: anaAvg, maxValue: 10 }, { value: brunoAvg, maxValue: 10 }]);
  check(classAvg === 6.5, `Média da turma = 6.5 (obtido ${classAvg})`);

  // 7. unique grade (assessment+student) — atualizar não duplica
  await prisma.grade.upsert({
    where: { assessmentId_studentId: { assessmentId: prova.id, studentId: a1.id } },
    update: { value: 9 }, create: { assessmentId: prova.id, studentId: a1.id, assignmentId: assignment.id, value: 9 },
  });
  const anaProvaCount = await prisma.grade.count({ where: { assessmentId: prova.id, studentId: a1.id } });
  check(anaProvaCount === 1, "Nota é única por (avaliação, aluno) — upsert não duplica");

  await cleanup();
  console.log(failures === 0 ? "\n🎉 TODOS OS TESTES PASSARAM" : `\n⚠️ ${failures} teste(s) falharam`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
