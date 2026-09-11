"use server";

import { prisma } from "@/lib/prisma";
import { getAccessibleAssignment } from "@/lib/teacher";
import { revalidatePath } from "next/cache";

type Result = { ok?: true; error?: string };

export async function createMaterial(assignmentId: string, formData: FormData): Promise<Result> {
  const assignment = await getAccessibleAssignment(assignmentId);
  if (!assignment) return { error: "Acesso negado." };
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "O título é obrigatório." };
  await prisma.material.create({
    data: {
      assignmentId,
      title,
      url: str(formData.get("url")),
      description: str(formData.get("description")),
    },
  });
  revalidatePath("/professor/materiais");
  return { ok: true };
}

export async function deleteMaterial(assignmentId: string, materialId: string): Promise<Result> {
  const assignment = await getAccessibleAssignment(assignmentId);
  if (!assignment) return { error: "Acesso negado." };
  await prisma.material.delete({ where: { id: materialId } });
  revalidatePath("/professor/materiais");
  return { ok: true };
}

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v || "").trim();
  return s.length ? s : null;
}
