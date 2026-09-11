import { prisma } from "@/lib/prisma";
import { ClassesClient } from "./ClassesClient";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const classes = await prisma.classGroup.findMany({
    orderBy: [{ schoolYear: "desc" }, { name: "asc" }],
    include: {
      _count: { select: { students: true, assignments: true } },
    },
  });
  return <ClassesClient classes={classes} />;
}
