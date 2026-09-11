"use server";

import { prisma } from "@/lib/prisma";
import { getAccessibleAssignment } from "@/lib/teacher";
import { revalidatePath } from "next/cache";
import { SOCIOLOGIA_AULAS } from "@/lib/sociologia";

type Result = { ok?: true; error?: string; imported?: number };

/** Cria uma aula PLANEJADA (planned=true) para uma atribuição. */
export async function createPlannedLesson(
  assignmentId: string,
  formData: FormData
): Promise<Result> {
  const assignment = await getAccessibleAssignment(assignmentId);
  if (!assignment) return { error: "Acesso negado a esta turma/disciplina." };

  const topic = String(formData.get("topic") || "").trim();
  if (!topic) return { error: "O tema é obrigatório." };

  await prisma.lesson.create({
    data: {
      assignmentId,
      teacherId: assignment.teacherId,
      number: numOrNull(formData.get("number")),
      topic,
      objective: str(formData.get("objective")),
      content: str(formData.get("content")),
      methodology: str(formData.get("methodology")),
      activity: str(formData.get("activity")),
      bnccCodes: str(formData.get("bnccCodes")),
      planned: true,
    },
  });
  revalidatePath(`/professor/planejamento`);
  return { ok: true };
}

export async function deletePlannedLesson(
  assignmentId: string,
  lessonId: string
): Promise<Result> {
  const assignment = await getAccessibleAssignment(assignmentId);
  if (!assignment) return { error: "Acesso negado." };
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/professor/planejamento`);
  return { ok: true };
}

/** Cria/atualiza um plano de ensino (Plan) para a atribuição. */
export async function savePlan(assignmentId: string, formData: FormData): Promise<Result> {
  const assignment = await getAccessibleAssignment(assignmentId);
  if (!assignment) return { error: "Acesso negado." };
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "O título do plano é obrigatório." };
  const planId = str(formData.get("planId"));

  const data = {
    assignmentId,
    teacherId: assignment.teacherId,
    title,
    description: str(formData.get("description")),
    period: str(formData.get("period")),
    bnccCodes: str(formData.get("bnccCodes")),
  };
  if (planId) await prisma.plan.update({ where: { id: planId }, data });
  else await prisma.plan.create({ data });
  revalidatePath(`/professor/planejamento`);
  return { ok: true };
}

export async function deletePlan(assignmentId: string, planId: string): Promise<Result> {
  const assignment = await getAccessibleAssignment(assignmentId);
  if (!assignment) return { error: "Acesso negado." };
  await prisma.plan.delete({ where: { id: planId } });
  revalidatePath(`/professor/planejamento`);
  return { ok: true };
}

/** Importa as 22 aulas de Sociologia como aulas planejadas nesta atribuição. */
export async function importSociologiaLessons(assignmentId: string): Promise<Result> {
  const assignment = await getAccessibleAssignment(assignmentId);
  if (!assignment) return { error: "Acesso negado." };

  // evita duplicar: só importa números que ainda não existam como planejados
  const existing = await prisma.lesson.findMany({
    where: { assignmentId, planned: true },
    select: { number: true },
  });
  const existingNumbers = new Set(existing.map((e) => e.number));

  let imported = 0;
  for (const a of SOCIOLOGIA_AULAS) {
    if (existingNumbers.has(a.number)) continue;
    await prisma.lesson.create({
      data: {
        assignmentId,
        teacherId: assignment.teacherId,
        number: a.number,
        topic: a.topic,
        objective: a.objective,
        content: a.content,
        methodology: a.methodology,
        activity: a.activity,
        bnccCodes: a.bnccCodes,
        planned: true,
      },
    });
    imported++;
  }
  revalidatePath(`/professor/planejamento`);
  return { ok: true, imported };
}

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v || "").trim();
  return s.length ? s : null;
}
function numOrNull(v: FormDataEntryValue | null): number | null {
  const n = Number(v);
  return Number.isFinite(n) && String(v || "").trim() !== "" ? n : null;
}
