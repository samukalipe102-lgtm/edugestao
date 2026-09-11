"use server";

import { prisma } from "@/lib/prisma";
import { requireExactRole } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function saveSchool(formData: FormData) {
  await requireExactRole("ADMIN");

  const data = {
    name: String(formData.get("name") || "").trim(),
    code: str(formData.get("code")),
    state: str(formData.get("state")),
    educationSecretary: str(formData.get("educationSecretary")),
    municipality: str(formData.get("municipality")),
    address: str(formData.get("address")),
    contact: str(formData.get("contact")),
    logoUrl: str(formData.get("logoUrl")),
    schoolYear: str(formData.get("schoolYear")),
    directorName: str(formData.get("directorName")),
    secretaryName: str(formData.get("secretaryName")),
  };

  if (!data.name) {
    return { error: "O nome da escola é obrigatório." };
  }

  const existing = await prisma.school.findFirst();
  if (existing) {
    await prisma.school.update({ where: { id: existing.id }, data });
  } else {
    await prisma.school.create({ data });
  }

  revalidatePath("/admin/configuracoes");
  revalidatePath("/admin");
  return { ok: true };
}

function str(v: FormDataEntryValue | null): string | null {
  const s = String(v || "").trim();
  return s.length ? s : null;
}
