import { prisma } from "@/lib/prisma";
import { BnccClient } from "./BnccClient";

export const dynamic = "force-dynamic";

export default async function BnccPage() {
  const [skills, subjects] = await Promise.all([
    prisma.bnccSkill.findMany({
      orderBy: { code: "asc" },
      include: { subject: true },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <BnccClient
      skills={skills.map((s) => ({
        id: s.id,
        code: s.code,
        stage: s.stage,
        grade: s.grade,
        area: s.area,
        component: s.component,
        description: s.description,
        subjectId: s.subjectId,
        subjectName: s.subject?.name ?? null,
      }))}
      subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
    />
  );
}
