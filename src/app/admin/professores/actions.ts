"use server";

import { prisma } from "@/lib/prisma";
import { requireExactRole } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

type Result = { ok?: true; error?: string; inviteUrl?: string };

/** Cadastra/convida um professor. Gera token de convite para o primeiro acesso. */
export async function inviteTeacher(formData: FormData): Promise<Result> {
  await requireExactRole("ADMIN");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = str(formData.get("phone"));

  if (!name || !email) return { error: "Nome e e-mail são obrigatórios." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "E-mail inválido." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Já existe um usuário com este e-mail." };

  const inviteToken = randomBytes(24).toString("hex");

  await prisma.user.create({
    data: {
      name,
      email,
      role: "TEACHER",
      active: true,
      inviteToken,
      invitedAt: new Date(),
      teacher: { create: { phone } },
    },
  });

  revalidatePath("/admin/professores");
  // Sem envio de e-mail neste momento (conforme escopo): retornamos o link do convite.
  return { ok: true, inviteUrl: `/convite/${inviteToken}` };
}

export async function updateTeacher(userId: string, formData: FormData): Promise<Result> {
  await requireExactRole("ADMIN");
  const name = String(formData.get("name") || "").trim();
  const phone = str(formData.get("phone"));
  if (!name) return { error: "O nome é obrigatório." };

  await prisma.user.update({
    where: { id: userId },
    data: { name, teacher: { update: { phone } } },
  });
  revalidatePath("/admin/professores");
  return { ok: true };
}

export async function toggleTeacherActive(userId: string): Promise<Result> {
  await requireExactRole("ADMIN");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Professor não encontrado." };
  await prisma.user.update({ where: { id: userId }, data: { active: !user.active } });
  revalidatePath("/admin/professores");
  return { ok: true };
}

/** Regenera o link de convite (caso o professor ainda não tenha acessado). */
export async function regenerateInvite(userId: string): Promise<Result> {
  await requireExactRole("ADMIN");
  const inviteToken = randomBytes(24).toString("hex");
  await prisma.user.update({
    where: { id: userId },
    data: { inviteToken, invitedAt: new Date(), acceptedAt: null },
  });
  revalidatePath("/admin/professores");
  return { ok: true, inviteUrl: `/convite/${inviteToken}` };
}

export async function deleteTeacher(userId: string): Promise<Result> {
  await requireExactRole("ADMIN");
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    include: { _count: { select: { assignments: true } } },
  });
  if (teacher && teacher._count.assignments > 0) {
    return { error: "Remova as atribuições deste professor antes de excluí-lo." };
  }
  await prisma.user.delete({ where: { id: userId } }); // cascade remove teacher
  revalidatePath("/admin/professores");
  return { ok: true };
}

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v || "").trim();
  return s.length ? s : null;
}
