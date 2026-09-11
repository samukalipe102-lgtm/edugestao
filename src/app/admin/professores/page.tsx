import { prisma } from "@/lib/prisma";
import { TeachersClient } from "./TeachersClient";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const teachers = await prisma.teacher.findMany({
    orderBy: { user: { name: "asc" } },
    include: {
      user: true,
      assignments: { include: { classGroup: true, subject: true } },
    },
  });

  const data = teachers.map((t) => ({
    id: t.id,
    userId: t.userId,
    name: t.user.name,
    email: t.user.email,
    phone: t.phone,
    active: t.user.active,
    accepted: !!t.user.acceptedAt,
    inviteToken: t.user.inviteToken,
    assignments: t.assignments.map((a) => ({
      id: a.id,
      classGroup: a.classGroup.name,
      subject: a.subject.name,
    })),
  }));

  return <TeachersClient teachers={data} />;
}
