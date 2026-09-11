"use server";

import { prisma } from "@/lib/prisma";
import { requireExactRole } from "@/lib/session";
import { revalidatePath } from "next/cache";

type Result = { ok?: true; error?: string };

export async function createSubject(formData: FormData): Promise<Result> {
  await requireExactRole("ADMIN");
  const name = String(formData.get("name") || "").trim();
  const code = str(formData.get("code"));
  const area = str(formData.get("area"));
  if (!name) return { error: "O nome da disciplina é obrigatório." };

  await prisma.subject.create({ data: { name, code, area } });
  revalidatePath("/admin/disciplinas");
  return { ok: true };
}

export async function updateSubject(id: string, formData: FormData): Promise<Result> {
  await requireExactRole("ADMIN");
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "O nome da disciplina é obrigatório." };
  await prisma.subject.update({
    where: { id },
    data: { name, code: str(formData.get("code")), area: str(formData.get("area")) },
  });
  revalidatePath("/admin/disciplinas");
  return { ok: true };
}

export async function deleteSubject(id: string): Promise<Result> {
  await requireExactRole("ADMIN");
  const assignments = await prisma.assignment.count({ where: { subjectId: id } });
  if (assignments > 0) {
    return {
      error: "Não é possível excluir: existem atribuições usando esta disciplina.",
    };
  }
  await prisma.subject.delete({ where: { id } });
  revalidatePath("/admin/disciplinas");
  return { ok: true };
}

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v || "").trim();
  return s.length ? s : null;
}
