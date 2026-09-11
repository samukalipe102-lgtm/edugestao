import { prisma } from "@/lib/prisma";

export type SchoolData = {
  name: string;
  code: string | null;
  state: string | null;
  educationSecretary: string | null;
  municipality: string | null;
  address: string | null;
  contact: string | null;
  logoUrl: string | null;
  schoolYear: string | null;
  directorName: string | null;
  secretaryName: string | null;
};

export async function getSchool(): Promise<SchoolData | null> {
  const s = await prisma.school.findFirst();
  if (!s) return null;
  return {
    name: s.name,
    code: s.code,
    state: s.state,
    educationSecretary: s.educationSecretary,
    municipality: s.municipality,
    address: s.address,
    contact: s.contact,
    logoUrl: s.logoUrl,
    schoolYear: s.schoolYear,
    directorName: s.directorName,
    secretaryName: s.secretaryName,
  };
}

export function formatDateBR(d: Date = new Date()): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}
