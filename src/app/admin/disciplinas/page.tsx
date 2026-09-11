import { prisma } from "@/lib/prisma";
import { SubjectsClient } from "./SubjectsClient";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { assignments: true } } },
  });
  return <SubjectsClient subjects={subjects} />;
}
