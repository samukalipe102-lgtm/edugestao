import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/** Retorna o Teacher do usuário logado (ou null). */
export async function getCurrentTeacher() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  return prisma.teacher.findFirst({ where: { userId: session.user.id } });
}

/**
 * Garante que a atribuição pertence ao professor logado.
 * ADMIN tem acesso a qualquer atribuição. Retorna a assignment ou null.
 */
export async function getAccessibleAssignment(assignmentId: string) {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      classGroup: true,
      subject: true,
      teacher: { include: { user: true } },
    },
  });
  if (!assignment) return null;

  if (session.user.role === "ADMIN") return assignment;

  const teacher = await prisma.teacher.findFirst({ where: { userId: session.user.id } });
  if (!teacher || assignment.teacherId !== teacher.id) return null;
  return assignment;
}

export const WEEKDAYS = [
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

export function weekdayLabel(v: number): string {
  return WEEKDAYS.find((w) => w.value === v)?.label ?? String(v);
}
