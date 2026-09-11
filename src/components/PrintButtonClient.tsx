"use client";

export function PrintButtonClient() {
  return (
    <button className="btn-primary" onClick={() => window.print()}>
      🖨️ Imprimir / Salvar PDF
    </button>
  );
}
