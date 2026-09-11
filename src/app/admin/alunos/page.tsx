import { prisma } from "@/lib/prisma";
import { StudentsClient } from "./StudentsClient";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const [students, classes] = await Promise.all([
    prisma.student.findMany({
      orderBy: { name: "asc" },
      include: { classGroup: true, guardian: true },
    }),
    prisma.classGroup.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <StudentsClient
      students={students.map((s) => ({
        id: s.id,
        name: s.name,
        registration: s.registration,
        email: s.email,
        phone: s.phone,
        status: s.status,
        classGroupId: s.classGroupId,
        className: s.classGroup?.name ?? null,
        guardianName: s.guardian?.name ?? null,
      }))}
      classes={classes.map((c) => ({ id: c.id, name: c.name, schoolYear: c.schoolYear }))}
    />
  );
}
