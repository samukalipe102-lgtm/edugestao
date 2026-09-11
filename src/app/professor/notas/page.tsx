import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/teacher";
import { GradesClient } from "./GradesClient";
import { EmptyState, PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function TeacherGradesPage({
  searchParams,
}: {
  searchParams: { a?: string };
}) {
  const teacher = await getCurrentTeacher();
  const assignments = teacher
    ? await prisma.assignment.findMany({
        where: { teacherId: teacher.id },
        include: { classGroup: true, subject: true },
        orderBy: [{ classGroup: { name: "asc" } }, { subject: { name: "asc" } }],
      })
    : [];

  if (assignments.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Notas" />
        <EmptyState message="Você ainda não possui turmas/disciplinas atribuídas." />
      </div>
    );
  }

  const selectedId =
    searchParams.a && assignments.find((a) => a.id === searchParams.a)
      ? searchParams.a
      : assignments[0].id;
  const selected = assignments.find((a) => a.id === selectedId)!;

  const [students, assessments, gradeRows] = await Promise.all([
    prisma.student.findMany({
      where: { classGroupId: selected.classGroupId, status: { not: "INACTIVE" } },
      orderBy: { name: "asc" },
    }),
    prisma.assessment.findMany({
      where: { assignmentId: selectedId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.grade.findMany({
      where: { assignmentId: selectedId },
    }),
  ]);

  return (
    <GradesClient
      assignments={assignments.map((a) => ({
        id: a.id,
        label: `${a.classGroup.name} · ${a.subject.name}`,
      }))}
      selectedId={selectedId}
      students={students.map((s) => ({ id: s.id, name: s.name, registration: s.registration }))}
      assessments={assessments.map((a) => ({
        id: a.id,
        name: a.name,
        maxValue: a.maxValue,
        date: a.date ? a.date.toISOString().slice(0, 10) : null,
      }))}
      grades={gradeRows.map((g) => ({
        assessmentId: g.assessmentId,
        studentId: g.studentId,
        value: g.value,
      }))}
    />
  );
}
