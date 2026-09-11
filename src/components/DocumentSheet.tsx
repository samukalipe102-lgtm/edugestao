import type { SchoolData } from "@/lib/school";
import { formatDateBR } from "@/lib/school";
import { PrintButtonClient } from "./PrintButtonClient";

function PrintButton() {
  return <PrintButtonClient />;
}

export function DocumentSheet({
  school,
  title,
  children,
  signatureRole = "Secretaria de Escola",
  signatureName,
}: {
  school: SchoolData | null;
  title: string;
  children: React.ReactNode;
  signatureRole?: string;
  signatureName?: string | null;
}) {
  return (
    <div className="doc-page">
      <div className="no-print mb-4 flex items-center justify-between max-w-[800px] mx-auto">
        <a href="/admin/documentos" className="text-sm text-brand-600 hover:underline">
          ← Documentos
        </a>
        <PrintButton />
      </div>

      <div className="doc-sheet text-slate-800">
        {/* Cabeçalho institucional */}
        <header className="text-center border-b-2 border-slate-800 pb-4 mb-6">
          <div className="flex items-center justify-center gap-4">
            {school?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={school.logoUrl} alt="Logotipo" className="h-16 w-16 object-contain" />
            ) : null}
            <div>
              {school?.state && (
                <p className="text-xs uppercase tracking-wide">Estado {school.state}</p>
              )}
              {school?.educationSecretary && (
                <p className="text-xs uppercase tracking-wide">{school.educationSecretary}</p>
              )}
              <p className="text-lg font-bold uppercase">{school?.name ?? "Escola não configurada"}</p>
              <p className="text-xs text-slate-600">
                {[
                  school?.code ? `Código ${school.code}` : null,
                  school?.municipality,
                  school?.address,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {school?.contact && <p className="text-xs text-slate-600">{school.contact}</p>}
            </div>
          </div>
        </header>

        <h1 className="text-center text-xl font-bold uppercase mb-6">{title}</h1>

        <main className="space-y-4 text-[14px] leading-relaxed">{children}</main>

        {/* Assinatura */}
        <footer className="mt-16">
          <p className="text-center text-sm mb-12">
            {school?.municipality ? `${school.municipality}, ` : ""}
            {formatDateBR()}.
          </p>
          <div className="mx-auto w-72 text-center">
            <div className="border-t border-slate-800 pt-1">
              <p className="text-sm font-medium">{signatureName || "_______________________"}</p>
              <p className="text-xs text-slate-600">{signatureRole}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
