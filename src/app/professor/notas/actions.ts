"use server";

import { prisma } from "@/lib/prisma";
import { getAccessibleAssignment } from "@/lib/teacher";
import { revalidatePath } from "next/cache";

type Result = { ok?: true; error?: string };

export async function createAssessment(
  assignmentId: string,
  formData: FormData
): Promise<Result> {
  const assignment = await getAccessibleAssignment(assignmentId);
  if (!assignment) return { error: "Acesso negado." };
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "O nome da avaliação é obrigatório." };
  const maxValue = Number(formData.get("maxValue"));
  const dateStr = str(formData.get("date"));

  await prisma.assessment.create({
    data: {
      assignmentId,
      name,
      maxValue: Number.isFinite(maxValue) && maxValue > 0 ? maxValue : 10,
      date: dateStr ? new Date(dateStr) : null,
    },
  });
  revalidatePath("/professor/notas");
  return { ok: true };
}

export async function deleteAssessment(
  assignmentId: string,
  assessmentId: string
): Promise<Result> {
  const assignment = await getAccessibleAssignment(assignmentId);
  if (!assignment) return { error: "Acesso negado." };
  await prisma.assessment.delete({ where: { id: assessmentId } });
  revalidatePath("/professor/notas");
  return { ok: true };
}

/**
 * Lança/edita notas de uma avaliação.
 * grades: array de { studentId, value | null }. null remove a nota.
 */
export async function saveGrades(
  assignmentId: string,
  assessmentId: string,
  grades: { studentId: string; value: number | null }[]
): Promise<Result> {
  const assignment = await getAccessibleAssignment(assignmentId);
  if (!assignment) return { error: "Acesso negado." };

  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!assessment || assessment.assignmentId !== assignmentId) {
    return { error: "Avaliação inválida." };
  }

  // valida alunos da turma
  const students = await prisma.student.findMany({
    where: { classGroupId: assignment.classGroupId },
    select: { id: true },
  });
  const validIds = new Set(students.map((s) => s.id));

  const ops = [];
  for (const g of grades) {
    if (!validIds.has(g.studentId)) continue;
    if (g.value === null || Number.isNaN(g.value)) {
      ops.push(
        prisma.grade.deleteMany({
          where: { assessmentId, studentId: g.studentId },
        })
      );
    } else {
      const value = Math.max(0, Math.min(g.value, assessment.maxValue));
      ops.push(
        prisma.grade.upsert({
          where: { assessmentId_studentId: { assessmentId, studentId: g.studentId } },
          update: { value, assignmentId },
          create: { assessmentId, studentId: g.studentId, assignmentId, value },
        })
      );
    }
  }
  await prisma.$transaction(ops);
  revalidatePath("/professor/notas");
  return { ok: true };
}

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v || "").trim();
  return s.length ? s : null;
}
