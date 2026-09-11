// Teste funcional do Bloco 3: horários, aulas, chamada, frequência (máx 2 slots).
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();
let failures = 0;
function check(cond, msg) {
  console.log(`${cond ? "✅" : "❌"} ${msg}`);
  if (!cond) failures++;
}

async function cleanup() {
  await prisma.attendance.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.lesson.deleteMany({});
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
  const teacherUser = await prisma.user.create({
    data: {
      name: "Prof. T3", email: "t3@escola.edu", role: "TEACHER",
      inviteToken: randomBytes(8).toString("hex"),
      teacher: { create: {} },
    },
    include: { teacher: true },
  });
  const cls = await prisma.classGroup.create({ data: { name: "T3", schoolYear: "2026" } });
  const assignment = await prisma.assignment.create({
    data: { classGroupId: cls.id, subjectId: subject.id, teacherId: teacherUser.teacher.id },
  });
  const alunos = await Promise.all([
    prisma.student.create({ data: { name: "A1", registration: "T3-1", classGroupId: cls.id } }),
    prisma.student.create({ data: { name: "A2", registration: "T3-2", classGroupId: cls.id } }),
    prisma.student.create({ data: { name: "A3", registration: "T3-3", classGroupId: cls.id } }),
  ]);

  // 1. Horário: segunda (1), 1ª aula 07:30-08:20
  const sched = await prisma.schedule.create({
    data: { assignmentId: assignment.id, weekday: 1, startTime: "07:30", endTime: "08:20", lessonNumber: 1 },
  });
  check(!!sched.id, "Horário criado (grade)");

  // 2. Registro de aula vinculado à atribuição
  const lesson = await prisma.lesson.create({
    data: { assignmentId: assignment.id, teacherId: teacherUser.teacher.id, number: 1, topic: "Introdução", date: new Date("2026-09-14"), planned: false },
  });
  check(lesson.assignmentId === assignment.id, "Registro de aula vinculado à turma/disciplina");

  // 3. Chamada slot 1: A1 presente, A2 falta, A3 presente
  const date = new Date("2026-09-14T00:00:00");
  await prisma.$transaction([
    prisma.attendance.upsert({ where: { assignmentId_studentId_date_slot: { assignmentId: assignment.id, studentId: alunos[0].id, date, slot: 1 } }, update: { present: true }, create: { assignmentId: assignment.id, studentId: alunos[0].id, date, slot: 1, present: true, lessonId: lesson.id } }),
    prisma.attendance.upsert({ where: { assignmentId_studentId_date_slot: { assignmentId: assignment.id, studentId: alunos[1].id, date, slot: 1 } }, update: { present: false }, create: { assignmentId: assignment.id, studentId: alunos[1].id, date, slot: 1, present: false, lessonId: lesson.id } }),
    prisma.attendance.upsert({ where: { assignmentId_studentId_date_slot: { assignmentId: assignment.id, studentId: alunos[2].id, date, slot: 1 } }, update: { present: true }, create: { assignmentId: assignment.id, studentId: alunos[2].id, date, slot: 1, present: true, lessonId: lesson.id } }),
  ]);
  const slot1 = await prisma.attendance.count({ where: { assignmentId: assignment.id, slot: 1 } });
  check(slot1 === 3, "Chamada slot 1 registrada (3 alunos)");

  // 4. Chamada slot 2 (segunda aula do registro) — permitido
  await prisma.attendance.create({ data: { assignmentId: assignment.id, studentId: alunos[0].id, date, slot: 2, present: true } });
  const slot2 = await prisma.attendance.count({ where: { assignmentId: assignment.id, slot: 2 } });
  check(slot2 === 1, "Chamada slot 2 permitida (2ª aula do registro)");

  // 5. Upsert idempotente: re-salvar slot 1 do A2 como presente não duplica
  await prisma.attendance.upsert({
    where: { assignmentId_studentId_date_slot: { assignmentId: assignment.id, studentId: alunos[1].id, date, slot: 1 } },
    update: { present: true }, create: { assignmentId: assignment.id, studentId: alunos[1].id, date, slot: 1, present: true },
  });
  const afterUpdate = await prisma.attendance.findFirst({ where: { assignmentId: assignment.id, studentId: alunos[1].id, date, slot: 1 } });
  const noDup = await prisma.attendance.count({ where: { assignmentId: assignment.id, studentId: alunos[1].id, date, slot: 1 } });
  check(afterUpdate.present === true && noDup === 1, "Re-salvar chamada atualiza sem duplicar (upsert)");

  // 6. Frequência A1: 2 registros, 2 presenças = 100%
  const a1recs = await prisma.attendance.findMany({ where: { assignmentId: assignment.id, studentId: alunos[0].id } });
  const a1present = a1recs.filter((a) => a.present).length;
  const a1pct = Math.round((a1present / a1recs.length) * 100);
  check(a1recs.length === 2 && a1pct === 100, "Cálculo de frequência (A1 = 100%)");

  // 7. Detecção de aula pelo horário: segunda-feira 2026-09-14 tem 1 aula
  const jsDay = new Date("2026-09-14T00:00:00").getDay(); // 1 = segunda
  const isoDay = jsDay === 0 ? 7 : jsDay;
  const daySchedules = await prisma.schedule.findMany({ where: { assignmentId: assignment.id, weekday: isoDay } });
  check(daySchedules.length === 1 && daySchedules[0].lessonNumber === 1, "Chamada identifica a aula pelo horário do dia");

  await cleanup();
  console.log(failures === 0 ? "\n🎉 TODOS OS TESTES PASSARAM" : `\n⚠️ ${failures} teste(s) falharam`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
