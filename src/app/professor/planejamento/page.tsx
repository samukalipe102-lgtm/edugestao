import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/teacher";
import { PlanningClient } from "./PlanningClient";
import { EmptyState, PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function PlanningPage({
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
        <PageHeader title="Planejamento" />
        <EmptyState message="Você ainda não possui turmas/disciplinas atribuídas." />
      </div>
    );
  }

  const selectedId = searchParams.a && assignments.find((a) => a.id === searchParams.a)
    ? searchParams.a
    : assignments[0].id;
  const selected = assignments.find((a) => a.id === selectedId)!;

  const [plannedLessons, plans, bnccSkills] = await Promise.all([
    prisma.lesson.findMany({
      where: { assignmentId: selectedId, planned: true },
      orderBy: [{ number: "asc" }, { createdAt: "asc" }],
    }),
    prisma.plan.findMany({
      where: { assignmentId: selectedId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bnccSkill.findMany({
      where: { subjectId: selected.subjectId },
      orderBy: { code: "asc" },
    }),
  ]);

  return (
    <PlanningClient
      assignments={assignments.map((a) => ({
        id: a.id,
        label: `${a.classGroup.name} · ${a.subject.name}`,
      }))}
      selectedId={selectedId}
      plannedLessons={plannedLessons.map((l) => ({
        id: l.id,
        number: l.number,
        topic: l.topic,
        objective: l.objective,
        content: l.content,
        methodology: l.methodology,
        activity: l.activity,
        bnccCodes: l.bnccCodes,
      }))}
      plans={plans.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        period: p.period,
        bnccCodes: p.bnccCodes,
      }))}
      bnccSkills={bnccSkills.map((s) => ({ code: s.code, description: s.description }))}
    />
  );
}
