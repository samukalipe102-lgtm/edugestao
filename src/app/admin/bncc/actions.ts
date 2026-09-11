"use server";

import { prisma } from "@/lib/prisma";
import { requireExactRole } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { SOCIOLOGIA_BNCC } from "@/lib/sociologia";

type Result = { ok?: true; error?: string; imported?: number };

export async function createSkill(formData: FormData): Promise<Result> {
  await requireExactRole("ADMIN");
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const description = String(formData.get("description") || "").trim();
  if (!code) return { error: "O código da habilidade é obrigatório." };
  if (!description) return { error: "A descrição é obrigatória." };

  const exists = await prisma.bnccSkill.findUnique({ where: { code } });
  if (exists) return { error: "Já existe uma habilidade com este código." };

  await prisma.bnccSkill.create({
    data: {
      code,
      description,
      stage: str(formData.get("stage")),
      grade: str(formData.get("grade")),
      area: str(formData.get("area")),
      component: str(formData.get("component")),
      subjectId: str(formData.get("subjectId")) || undefined,
    },
  });
  revalidatePath("/admin/bncc");
  return { ok: true };
}

export async function updateSkill(id: string, formData: FormData): Promise<Result> {
  await requireExactRole("ADMIN");
  const description = String(formData.get("description") || "").trim();
  if (!description) return { error: "A descrição é obrigatória." };
  await prisma.bnccSkill.update({
    where: { id },
    data: {
      description,
      stage: str(formData.get("stage")),
      grade: str(formData.get("grade")),
      area: str(formData.get("area")),
      component: str(formData.get("component")),
      subjectId: str(formData.get("subjectId")) || null,
    },
  });
  revalidatePath("/admin/bncc");
  return { ok: true };
}

export async function deleteSkill(id: string): Promise<Result> {
  await requireExactRole("ADMIN");
  await prisma.bnccSkill.delete({ where: { id } });
  revalidatePath("/admin/bncc");
  return { ok: true };
}

/** Importa as habilidades BNCC de Sociologia, vinculando à disciplina informada (se houver). */
export async function importSociologiaBncc(subjectId?: string): Promise<Result> {
  await requireExactRole("ADMIN");
  let imported = 0;
  for (const s of SOCIOLOGIA_BNCC) {
    const exists = await prisma.bnccSkill.findUnique({ where: { code: s.code } });
    if (exists) {
      if (subjectId) await prisma.bnccSkill.update({ where: { code: s.code }, data: { subjectId } });
      continue;
    }
    await prisma.bnccSkill.create({
      data: {
        code: s.code,
        stage: s.stage,
        area: s.area,
        component: s.component,
        description: s.description,
        subjectId: subjectId || undefined,
      },
    });
    imported++;
  }
  revalidatePath("/admin/bncc");
  return { ok: true, imported };
}

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v || "").trim();
  return s.length ? s : null;
}
