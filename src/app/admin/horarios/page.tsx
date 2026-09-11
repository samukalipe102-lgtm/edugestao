import { prisma } from "@/lib/prisma";
import { SchedulesClient } from "./SchedulesClient";

export const dynamic = "force-dynamic";

export default async function SchedulesPage() {
  const [schedules, assignments] = await Promise.all([
    prisma.schedule.findMany({
      orderBy: [{ weekday: "asc" }, { lessonNumber: "asc" }],
      include: {
        assignment: {
          include: { classGroup: true, subject: true, teacher: { include: { user: true } } },
        },
      },
    }),
    prisma.assignment.findMany({
      include: { classGroup: true, subject: true, teacher: { include: { user: true } } },
      orderBy: { classGroup: { name: "asc" } },
    }),
  ]);

  return (
    <SchedulesClient
      schedules={schedules.map((s) => ({
        id: s.id,
        weekday: s.weekday,
        startTime: s.startTime,
        endTime: s.endTime,
        lessonNumber: s.lessonNumber,
        classGroup: s.assignment.classGroup.name,
        subject: s.assignment.subject.name,
        teacher: s.assignment.teacher.user.name,
      }))}
      assignments={assignments.map((a) => ({
        id: a.id,
        label: `${a.classGroup.name} · ${a.subject.name} · ${a.teacher.user.name}`,
      }))}
    />
  );
}
