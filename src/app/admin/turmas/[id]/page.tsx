import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ClassDetailClient } from "./ClassDetailClient";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({ params }: { params: { id: string } }) {
  const cls = await prisma.classGroup.findUnique({
    where: { id: params.id },
    include: {
      assignments: {
        include: { subject: true, teacher: { include: { user: true } } },
        orderBy: { subject: { name: "asc" } },
      },
      students: { orderBy: { name: "asc" } },
    },
  });
  if (!cls) notFound();

  const [subjects, teachers, unassignedStudents] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.teacher.findMany({
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.student.findMany({
      where: { classGroupId: null, status: { not: "INACTIVE" } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/admin/turmas" className="text-sm text-brand-600 hover:underline">
        ← Voltar para turmas
      </Link>
      <ClassDetailClient
        cls={{
          id: cls.id,
          name: cls.name,
          stage: cls.stage,
          schoolYear: cls.schoolYear,
          shift: cls.shift,
        }}
        assignments={cls.assignments.map((a) => ({
          id: a.id,
          subject: a.subject.name,
          teacher: a.teacher.user.name,
        }))}
        students={cls.students.map((s) => ({
          id: s.id,
          name: s.name,
          registration: s.registration,
          status: s.status,
        }))}
        subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
        teachers={teachers.map((t) => ({ id: t.id, name: t.user.name }))}
        availableStudents={unassignedStudents.map((s) => ({
          id: s.id,
          name: s.name,
          registration: s.registration,
        }))}
      />
    </div>
  );
}
