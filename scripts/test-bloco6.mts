// Bloco 6: verificações finais de dados/segurança (materiais + calendário via schedules).
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
let failures = 0;
function check(c: boolean, m: string) { console.log(`${c ? "✅" : "❌"} ${m}`); if (!c) failures++; }

async function cleanup() {
  await prisma.material.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.plan.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.classGroup.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.guardian.deleteMany({});
  await prisma.bnccSkill.deleteMany({});
  await prisma.user.deleteMany({ where: { role: { not: "ADMIN" } } });
  await prisma.teacher.deleteMany({});
}

async function main() {
  await cleanup();
  const subj = await prisma.subject.create({ data: { name: "Sociologia" } });
  const t = await prisma.user.create({ data: { name: "Prof", email: "p6@x.com", role: "TEACHER", teacher: { create: {} } }, include: { teacher: true } });
  const c = await prisma.classGroup.create({ data: { name: "T6", schoolYear: "2026" } });
  const a = await prisma.assignment.create({ data: { classGroupId: c.id, subjectId: subj.id, teacherId: t.teacher!.id } });

  // material vinculado à atribuição
  const mat = await prisma.material.create({ data: { assignmentId: a.id, title: "Apostila 1", url: "https://ex.com/a.pdf" } });
  check(mat.assignmentId === a.id, "Material vinculado à atribuição (turma/disciplina)");

  // calendário: schedule alimenta a grade
  const sch = await prisma.schedule.create({ data: { assignmentId: a.id, weekday: 3, startTime: "08:00", endTime: "08:50", lessonNumber: 1 } });
  const calEntries = await prisma.schedule.findMany({ where: { assignment: { teacherId: t.teacher!.id } } });
  check(calEntries.length === 1 && calEntries[0].weekday === 3, "Calendário do professor deriva dos horários (schedules)");

  // exclusão em cascata: apagar assignment remove materiais e schedules
  await prisma.assignment.delete({ where: { id: a.id } });
  const matAfter = await prisma.material.count();
  const schAfter = await prisma.schedule.count();
  check(matAfter === 0 && schAfter === 0, "Cascade: remover atribuição limpa materiais e horários");

  await cleanup();
  console.log(failures === 0 ? "\n🎉 TODOS OS TESTES PASSARAM" : `\n⚠️ ${failures} falharam`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
