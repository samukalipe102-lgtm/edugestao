// Teste funcional do Bloco 2 usando Prisma diretamente (server actions exigem sessão).
// Valida regras: sem matrícula duplicada, relação Turma+Disciplina+Professor, portal do professor.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();
let failures = 0;
function check(cond, msg) {
  console.log(`${cond ? "✅" : "❌"} ${msg}`);
  if (!cond) failures++;
}

async function main() {
  // limpeza de dados de teste anteriores
  await prisma.attendance.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.classGroup.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.guardian.deleteMany({});
  await prisma.user.deleteMany({ where: { role: "TEACHER" } });

  // 1. Disciplina
  const subject = await prisma.subject.create({
    data: { name: "Sociologia", area: "Ciências Humanas" },
  });
  check(!!subject.id, "Disciplina criada");

  // 2. Professor convidado (token, sem senha ainda)
  const token = randomBytes(16).toString("hex");
  const teacherUser = await prisma.user.create({
    data: {
      name: "Prof. Teste",
      email: "prof.teste@escola.edu",
      role: "TEACHER",
      inviteToken: token,
      invitedAt: new Date(),
      teacher: { create: { phone: "999" } },
    },
    include: { teacher: true },
  });
  check(!teacherUser.passwordHash && !!teacherUser.inviteToken, "Professor convidado (pendente, com token)");

  // 3. Aceite do convite (define senha, limpa token)
  const passwordHash = await bcrypt.hash("senha123", 10);
  const accepted = await prisma.user.update({
    where: { inviteToken: token },
    data: { passwordHash, inviteToken: null, acceptedAt: new Date() },
  });
  check(!!accepted.passwordHash && !accepted.inviteToken && !!accepted.acceptedAt, "Convite aceito (senha definida)");

  // 4. Turma
  const cls = await prisma.classGroup.create({
    data: { name: "Turma Demo", schoolYear: "2026", stage: "Ensino Médio", shift: "Matutino" },
  });
  check(!!cls.id, "Turma criada");

  // 5. Atribuição (relação principal)
  const assignment = await prisma.assignment.create({
    data: { classGroupId: cls.id, subjectId: subject.id, teacherId: teacherUser.teacher.id },
  });
  check(!!assignment.id, "Atribuição Turma+Disciplina+Professor criada");

  // 5b. Atribuição duplicada deve falhar (unique)
  let dupFailed = false;
  try {
    await prisma.assignment.create({
      data: { classGroupId: cls.id, subjectId: subject.id, teacherId: teacherUser.teacher.id },
    });
  } catch {
    dupFailed = true;
  }
  check(dupFailed, "Atribuição duplicada bloqueada (unique)");

  // 6. Aluno + matrícula na turma
  const student = await prisma.student.create({
    data: { name: "Aluno Teste", registration: "2026001", classGroupId: cls.id, status: "ACTIVE" },
  });
  check(student.classGroupId === cls.id, "Aluno criado e matriculado na turma");

  // 6b. Matrícula duplicada (registration unique) deve falhar
  let dupReg = false;
  try {
    await prisma.student.create({ data: { name: "Outro", registration: "2026001" } });
  } catch {
    dupReg = true;
  }
  check(dupReg, "Matrícula duplicada bloqueada (registration unique)");

  // 7. Portal do professor: vê apenas suas atribuições
  const teacherView = await prisma.teacher.findUnique({
    where: { id: teacherUser.teacher.id },
    include: { assignments: { include: { classGroup: true, subject: true } } },
  });
  check(
    teacherView.assignments.length === 1 &&
      teacherView.assignments[0].classGroup.name === "Turma Demo" &&
      teacherView.assignments[0].subject.name === "Sociologia",
    "Professor enxerga apenas sua turma/disciplina atribuída"
  );

  // 8. Transferência: desvincular aluno
  const transferred = await prisma.student.update({
    where: { id: student.id },
    data: { classGroupId: null, status: "TRANSFERRED" },
  });
  check(transferred.classGroupId === null && transferred.status === "TRANSFERRED", "Transferência/desvínculo funciona");

  // limpeza
  await prisma.attendance.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.classGroup.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.guardian.deleteMany({});
  await prisma.user.deleteMany({ where: { role: "TEACHER" } });

  console.log(failures === 0 ? "\n🎉 TODOS OS TESTES PASSARAM" : `\n⚠️ ${failures} teste(s) falharam`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
