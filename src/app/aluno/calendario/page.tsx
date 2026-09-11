import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";

export const dynamic = "force-dynamic";

export default async function StudentCalendarPage() {
  const session = await getSession();
  const student = await prisma.student.findFirst({ where: { userId: session?.user?.id } });

  const schedules = student?.classGroupId
    ? await prisma.schedule.findMany({
        where: { assignment: { classGroupId: student.classGroupId } },
        include: { assignment: { include: { classGroup: true, subject: true, teacher: { include: { user: true } } } } },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Calendário" subtitle="Grade semanal de aulas da sua turma" />
      {!student?.classGroupId ? (
        <EmptyState message="Você não está matriculado em uma turma." />
      ) : (
        <WeeklyCalendar
          entries={schedules.map((s) => ({
            weekday: s.weekday,
            startTime: s.startTime,
            endTime: s.endTime,
            lessonNumber: s.lessonNumber,
            classGroup: s.assignment.classGroup.name,
            subject: s.assignment.subject.name,
            teacher: s.assignment.teacher.user.name,
          }))}
        />
      )}
    </div>
  );
}
