import { prisma } from "@/lib/prisma";
import { computeAverage, situationLabel } from "@/lib/grades";

export type SubjectReport = {
  subject: string;
  teacher: string;
  average: number | null;
  situation: string;
  totalClasses: number;
  present: number;
  frequencyPct: number | null;
  grades: { name: string; value: number; maxValue: number }[];
};

export type StudentReport = {
  id: string;
  name: string;
  registration: string;
  className: string | null;
  schoolYear: string | null;
  status: string;
  guardianName: string | null;
  email: string | null;
  phone: string | null;
  subjects: SubjectReport[];
  overallAverage: number | null;
};

/** Monta o relatório acadêmico completo de um aluno. */
export async function buildStudentReport(studentId: string): Promise<StudentReport | null> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { classGroup: true, guardian: true },
  });
  if (!student) return null;

  const [grades, attendances] = await Promise.all([
    prisma.grade.findMany({
      where: { studentId },
      include: { assessment: true, assignment: { include: { subject: true, teacher: { include: { user: true } } } } },
    }),
    prisma.attendance.findMany({
      where: { studentId },
      include: { assignment: { include: { subject: true } } },
    }),
  ]);

  const map: Record<
    string,
    {
      subject: string;
      teacher: string;
      grades: { name: string; value: number; maxValue: number }[];
      present: number;
      total: number;
    }
  > = {};

  for (const g of grades) {
    const key = g.assignmentId;
    (map[key] ??= {
      subject: g.assignment.subject.name,
      teacher: g.assignment.teacher.user.name,
      grades: [],
      present: 0,
      total: 0,
    }).grades.push({ name: g.assessment.name, value: g.value, maxValue: g.assessment.maxValue });
  }
  for (const a of attendances) {
    const key = a.assignmentId;
    const row = (map[key] ??= { subject: a.assignment.subject.name, teacher: "", grades: [], present: 0, total: 0 });
    row.total += 1;
    if (a.present) row.present += 1;
  }

  const subjects: SubjectReport[] = Object.values(map).map((r) => {
    const average = computeAverage(r.grades);
    return {
      subject: r.subject,
      teacher: r.teacher,
      average,
      situation: situationLabel(average).label,
      totalClasses: r.total,
      present: r.present,
      frequencyPct: r.total > 0 ? Math.round((r.present / r.total) * 100) : null,
      grades: r.grades,
    };
  });

  const subjectAverages = subjects.map((s) => s.average).filter((x): x is number => x !== null);
  const overallAverage =
    subjectAverages.length > 0
      ? computeAverage(subjectAverages.map((v) => ({ value: v, maxValue: 10 })))
      : null;

  return {
    id: student.id,
    name: student.name,
    registration: student.registration,
    className: student.classGroup?.name ?? null,
    schoolYear: student.classGroup?.schoolYear ?? null,
    status: student.status,
    guardianName: student.guardian?.name ?? null,
    email: student.email,
    phone: student.phone,
    subjects,
    overallAverage,
  };
}
