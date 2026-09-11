"use server";

import { prisma } from "@/lib/prisma";
import { requireExactRole } from "@/lib/session";
import { revalidatePath } from "next/cache";

type Result = { ok?: true; error?: string; id?: string };

export async function createClass(formData: FormData): Promise<Result> {
  await requireExactRole("ADMIN");
  const name = String(formData.get("name") || "").trim();
  const schoolYear = String(formData.get("schoolYear") || "").trim();
  const stage = str(formData.get("stage"));
  const shift = str(formData.get("shift"));
  if (!name) return { error: "O nome da turma é obrigatório." };
  if (!schoolYear) return { error: "O ano letivo é obrigatório." };

  const created = await prisma.classGroup.create({
    data: { name, schoolYear, stage, shift },
  });
  revalidatePath("/admin/turmas");
  return { ok: true, id: created.id };
}

export async function updateClass(id: string, formData: FormData): Promise<Result> {
  await requireExactRole("ADMIN");
  const name = String(formData.get("name") || "").trim();
  const schoolYear = String(formData.get("schoolYear") || "").trim();
  if (!name || !schoolYear) return { error: "Nome e ano letivo são obrigatórios." };
  await prisma.classGroup.update({
    where: { id },
    data: {
      name,
      schoolYear,
      stage: str(formData.get("stage")),
      shift: str(formData.get("shift")),
    },
  });
  revalidatePath("/admin/turmas");
  revalidatePath(`/admin/turmas/${id}`);
  return { ok: true };
}

export async function deleteClass(id: string): Promise<Result> {
  await requireExactRole("ADMIN");
  const students = await prisma.student.count({ where: { classGroupId: id } });
  if (students > 0) {
    return { error: "Remova/transfira os alunos antes de excluir a turma." };
  }
  await prisma.classGroup.delete({ where: { id } });
  revalidatePath("/admin/turmas");
  return { ok: true };
}

// ---- Atribuições (Turma + Disciplina + Professor) ----

export async function createAssignment(
  classGroupId: string,
  formData: FormData
): Promise<Result> {
  await requireExactRole("ADMIN");
  const subjectId = String(formData.get("subjectId") || "");
  const teacherId = String(formData.get("teacherId") || "");
  if (!subjectId || !teacherId) {
    return { error: "Selecione a disciplina e o professor." };
  }
  const exists = await prisma.assignment.findUnique({
    where: { classGroupId_subjectId_teacherId: { classGroupId, subjectId, teacherId } },
  });
  if (exists) return { error: "Esta atribuição já existe." };

  await prisma.assignment.create({ data: { classGroupId, subjectId, teacherId } });
  revalidatePath(`/admin/turmas/${classGroupId}`);
  return { ok: true };
}

export async function deleteAssignment(id: string, classGroupId: string): Promise<Result> {
  await requireExactRole("ADMIN");
  await prisma.assignment.delete({ where: { id } });
  revalidatePath(`/admin/turmas/${classGroupId}`);
  return { ok: true };
}

// ---- Matrícula de alunos na turma ----

export async function enrollStudent(
  classGroupId: string,
  studentId: string
): Promise<Result> {
  await requireExactRole("ADMIN");
  await prisma.student.update({ where: { id: studentId }, data: { classGroupId } });
  revalidatePath(`/admin/turmas/${classGroupId}`);
  return { ok: true };
}

export async function unenrollStudent(
  classGroupId: string,
  studentId: string
): Promise<Result> {
  await requireExactRole("ADMIN");
  await prisma.student.update({ where: { id: studentId }, data: { classGroupId: null } });
  revalidatePath(`/admin/turmas/${classGroupId}`);
  return { ok: true };
}

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v || "").trim();
  return s.length ? s : null;
}
