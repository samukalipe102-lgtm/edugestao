"use server";

import { prisma } from "@/lib/prisma";
import { requireExactRole } from "@/lib/session";
import { revalidatePath } from "next/cache";

type Result = { ok?: true; error?: string; id?: string };

const VALID_STATUS = ["ACTIVE", "TRANSFERRED", "INACTIVE"];

/** Cria aluno. Opcionalmente cria/vincula um responsável pelo nome. */
export async function createStudent(formData: FormData): Promise<Result> {
  await requireExactRole("ADMIN");
  const name = String(formData.get("name") || "").trim();
  const registration = String(formData.get("registration") || "").trim();
  if (!name) return { error: "O nome do aluno é obrigatório." };
  if (!registration) return { error: "A matrícula é obrigatória." };

  const dup = await prisma.student.findUnique({ where: { registration } });
  if (dup) return { error: "Já existe um aluno com esta matrícula." };

  const classGroupId = str(formData.get("classGroupId"));
  const guardianName = str(formData.get("guardianName"));
  const guardianPhone = str(formData.get("guardianPhone"));
  const guardianEmail = str(formData.get("guardianEmail"));

  let guardianId: string | undefined;
  if (guardianName) {
    const guardian = await prisma.guardian.create({
      data: { name: guardianName, phone: guardianPhone, email: guardianEmail },
    });
    guardianId = guardian.id;
  }

  const created = await prisma.student.create({
    data: {
      name,
      registration,
      email: str(formData.get("email")),
      phone: str(formData.get("phone")),
      status: statusOf(formData.get("status")),
      classGroupId: classGroupId || undefined,
      guardianId,
    },
  });
  revalidatePath("/admin/alunos");
  return { ok: true, id: created.id };
}

export async function updateStudent(id: string, formData: FormData): Promise<Result> {
  await requireExactRole("ADMIN");
  const name = String(formData.get("name") || "").trim();
  const registration = String(formData.get("registration") || "").trim();
  if (!name || !registration) return { error: "Nome e matrícula são obrigatórios." };

  const dup = await prisma.student.findFirst({
    where: { registration, NOT: { id } },
  });
  if (dup) return { error: "Já existe outro aluno com esta matrícula." };

  await prisma.student.update({
    where: { id },
    data: {
      name,
      registration,
      email: str(formData.get("email")),
      phone: str(formData.get("phone")),
      status: statusOf(formData.get("status")),
      classGroupId: str(formData.get("classGroupId")) || null,
    },
  });
  revalidatePath("/admin/alunos");
  return { ok: true };
}

/** Transferência: muda turma e (opcionalmente) marca situação. */
export async function transferStudent(
  id: string,
  classGroupId: string | null,
  markTransferred: boolean
): Promise<Result> {
  await requireExactRole("ADMIN");
  await prisma.student.update({
    where: { id },
    data: {
      classGroupId: classGroupId || null,
      status: markTransferred ? "TRANSFERRED" : undefined,
    },
  });
  revalidatePath("/admin/alunos");
  return { ok: true };
}

export async function deleteStudent(id: string): Promise<Result> {
  await requireExactRole("ADMIN");
  const grades = await prisma.grade.count({ where: { studentId: id } });
  const att = await prisma.attendance.count({ where: { studentId: id } });
  if (grades > 0 || att > 0) {
    return {
      error:
        "Este aluno possui notas ou frequência registradas. Use “Desativar” em vez de excluir.",
    };
  }
  await prisma.student.delete({ where: { id } });
  revalidatePath("/admin/alunos");
  return { ok: true };
}

function statusOf(v: FormDataEntryValue | null): string {
  const s = String(v || "ACTIVE");
  return VALID_STATUS.includes(s) ? s : "ACTIVE";
}
function str(v: FormDataEntryValue | null): string | null {
  const s = String(v || "").trim();
  return s.length ? s : null;
}
