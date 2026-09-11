import { prisma } from "@/lib/prisma";
import { SchoolForm } from "./SchoolForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const school = await prisma.school.findFirst();
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Configurações da Escola</h2>
        <p className="text-sm text-slate-500">
          Estes dados são usados automaticamente na emissão de documentos e relatórios.
        </p>
      </div>
      <SchoolForm school={school} />
    </div>
  );
}
