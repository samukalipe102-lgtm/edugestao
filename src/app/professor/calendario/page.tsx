import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/teacher";
import { PageHeader } from "@/components/PageHeader";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";

export const dynamic = "force-dynamic";

export default async function TeacherCalendarPage() {
  const teacher = await getCurrentTeacher();
  const schedules = teacher
    ? await prisma.schedule.findMany({
        where: { assignment: { teacherId: teacher.id } },
        include: { assignment: { include: { classGroup: true, subject: true } } },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Calendário" subtitle="Sua grade semanal de aulas" />
      <WeeklyCalendar
        entries={schedules.map((s) => ({
          weekday: s.weekday,
          startTime: s.startTime,
          endTime: s.endTime,
          lessonNumber: s.lessonNumber,
          classGroup: s.assignment.classGroup.name,
          subject: s.assignment.subject.name,
        }))}
      />
    </div>
  );
}
