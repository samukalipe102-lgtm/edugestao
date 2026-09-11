import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";

export const dynamic = "force-dynamic";

export default async function AdminCalendarPage() {
  const schedules = await prisma.schedule.findMany({
    include: { assignment: { include: { classGroup: true, subject: true, teacher: { include: { user: true } } } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Calendário" subtitle="Grade semanal de aulas de toda a escola" />
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
    </div>
  );
}
