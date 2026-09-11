"use server";

import { prisma } from "@/lib/prisma";
import { getAccessibleAssignment } from "@/lib/teacher";
import { revalidatePath } from "next/cache";

type Result = { ok?: true; error?: string; lessonId?: string };

/** Cria/atualiza registro de aula (Lesson) ministrada. */
export async function saveLesson(
  assignmentId: string,
  formData: FormData
): Promise<Result> {
  const assignment = await getAccessibleAssignment(assignmentId);
  if (!assignment) return { error: "Acesso negado a esta turma/disciplina." };

  const topic = String(formData.get("topic") || "").trim();
  if (!topic) return { error: "O tema da aula é obrigatório." };

  const lessonId = str(formData.get("lessonId"));
  const dateStr = str(formData.get("date"));
  const data = {
    assignmentId,
    teacherId: assignment.teacherId,
    number: numOrNull(formData.get("number")),
    date: dateStr ? new Date(dateStr) : null,
    topic,
    content: str(formData.get("content")),
    objective: str(formData.get("objective")),
    methodology: str(formData.get("methodology")),
    activity: str(formData.get("activity")),
    bnccCodes: str(formData.get("bnccCodes")),
    planned: false,
  };

  let saved;
  if (lessonId) {
    saved = await prisma.lesson.update({ where: { id: lessonId }, data });
  } else {
    saved = await prisma.lesson.create({ data });
  }
  revalidatePath(`/professor/diario/${assignmentId}`);
  return { ok: true, lessonId: saved.id };
}

export async function deleteLesson(assignmentId: string, lessonId: string): Promise<Result> {
  const assignment = await getAccessibleAssignment(assignmentId);
  if (!assignment) return { error: "Acesso negado." };
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/professor/diario/${assignmentId}`);
  return { ok: true };
}

/**
 * Salva a chamada (frequência) de uma data.
 * `slot` é a "aula de frequência" (1 ou 2) — máx. 2 por registro.
 * `presence` é um mapa studentId -> boolean (presente).
 */
export async function saveAttendance(
  assignmentId: string,
  dateStr: string,
  slot: number,
  presence: Record<string, boolean>,
  lessonId?: string | null
): Promise<Result> {
  const assignment = await getAccessibleAssignment(assignmentId);
  if (!assignment) return { error: "Acesso negado a esta turma/disciplina." };
  if (!dateStr) return { error: "Informe a data da chamada." };
  if (slot !== 1 && slot !== 2) return { error: "São permitidas no máximo 2 aulas por registro." };

  const date = new Date(dateStr + "T00:00:00");

  // valida que os alunos pertencem à turma da atribuição
  const validStudents = await prisma.student.findMany({
    where: { classGroupId: assignment.classGroupId },
    select: { id: true },
  });
  const validIds = new Set(validStudents.map((s) => s.id));

  const ops = Object.entries(presence)
    .filter(([sid]) => validIds.has(sid))
    .map(([studentId, present]) =>
      prisma.attendance.upsert({
        where: {
          assignmentId_studentId_date_slot: { assignmentId, studentId, date, slot },
        },
        update: { present, lessonId: lessonId ?? undefined },
        create: { assignmentId, studentId, date, slot, present, lessonId: lessonId ?? undefined },
      })
    );

  await prisma.$transaction(ops);
  revalidatePath(`/professor/diario/${assignmentId}`);
  return { ok: true };
}

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v || "").trim();
  return s.length ? s : null;
}
function numOrNull(v: FormDataEntryValue | null): number | null {
  const n = Number(v);
  return Number.isFinite(n) && String(v || "").trim() !== "" ? n : null;
}
