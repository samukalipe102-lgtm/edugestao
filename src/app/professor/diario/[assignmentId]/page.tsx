import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAccessibleAssignment } from "@/lib/teacher";
import { DiaryClient } from "./DiaryClient";

export const dynamic = "force-dynamic";

export default async function DiaryPage({
  params,
}: {
  params: { assignmentId: string };
}) {
  const assignment = await getAccessibleAssignment(params.assignmentId);
  if (!assignment) {
    // sem acesso: volta ao portal
    redirect("/professor/turmas");
  }

  const [students, schedules, lessons, attendances] = await Promise.all([
    prisma.student.findMany({
      where: { classGroupId: assignment.classGroupId, status: { not: "INACTIVE" } },
      orderBy: { name: "asc" },
    }),
    prisma.schedule.findMany({
      where: { assignmentId: assignment.id },
      orderBy: [{ weekday: "asc" }, { lessonNumber: "asc" }],
    }),
    prisma.lesson.findMany({
      where: { assignmentId: assignment.id },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.attendance.findMany({
      where: { assignmentId: assignment.id },
      orderBy: { date: "desc" },
    }),
  ]);

  if (!assignment) notFound();

  return (
    <div className="space-y-6">
      <Link href="/professor/turmas" className="text-sm text-brand-600 hover:underline">
        ← Minhas turmas
      </Link>
      <DiaryClient
        assignmentId={assignment.id}
        header={{
          classGroup: assignment.classGroup.name,
          subject: assignment.subject.name,
          teacher: assignment.teacher.user.name,
          schoolYear: assignment.classGroup.schoolYear,
        }}
        students={students.map((s) => ({ id: s.id, name: s.name, registration: s.registration }))}
        schedules={schedules.map((s) => ({
          id: s.id,
          weekday: s.weekday,
          startTime: s.startTime,
          endTime: s.endTime,
          lessonNumber: s.lessonNumber,
        }))}
        lessons={lessons.map((l) => ({
          id: l.id,
          number: l.number,
          date: l.date ? l.date.toISOString().slice(0, 10) : null,
          topic: l.topic,
          content: l.content,
          objective: l.objective,
          methodology: l.methodology,
          activity: l.activity,
          bnccCodes: l.bnccCodes,
          planned: l.planned,
        }))}
        attendances={attendances.map((a) => ({
          studentId: a.studentId,
          date: a.date.toISOString().slice(0, 10),
          slot: a.slot,
          present: a.present,
        }))}
      />
    </div>
  );
}
