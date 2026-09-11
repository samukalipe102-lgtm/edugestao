"use server";

import { prisma } from "@/lib/prisma";
import { requireExactRole } from "@/lib/session";
import { revalidatePath } from "next/cache";

type Result = { ok?: true; error?: string };

export async function createSchedule(formData: FormData): Promise<Result> {
  await requireExactRole("ADMIN");
  const assignmentId = String(formData.get("assignmentId") || "");
  const weekday = Number(formData.get("weekday"));
  const startTime = String(formData.get("startTime") || "").trim();
  const endTime = String(formData.get("endTime") || "").trim();
  const lessonNumber = Number(formData.get("lessonNumber"));

  if (!assignmentId) return { error: "Selecione a atribuição (turma + disciplina + professor)." };
  if (!weekday || weekday < 1 || weekday > 7) return { error: "Dia da semana inválido." };
  if (!startTime || !endTime) return { error: "Informe os horários de início e fim." };
  if (startTime >= endTime) return { error: "O horário de início deve ser antes do fim." };
  if (!lessonNumber || lessonNumber < 1) return { error: "Número da aula inválido." };

  await prisma.schedule.create({
    data: { assignmentId, weekday, startTime, endTime, lessonNumber },
  });
  revalidatePath("/admin/horarios");
  return { ok: true };
}

export async function deleteSchedule(id: string): Promise<Result> {
  await requireExactRole("ADMIN");
  await prisma.schedule.delete({ where: { id } });
  revalidatePath("/admin/horarios");
  return { ok: true };
}
