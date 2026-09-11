// Cálculo de médias e situação acadêmica.

export const PASS_THRESHOLD = 6; // média mínima para aprovação (escala 0–10)

export type StudentGrade = { value: number; maxValue: number };

/** Média simples normalizada para escala 0–10. */
export function computeAverage(grades: StudentGrade[]): number | null {
  if (grades.length === 0) return null;
  const normalized = grades.map((g) =>
    g.maxValue > 0 ? (g.value / g.maxValue) * 10 : 0
  );
  const sum = normalized.reduce((a, b) => a + b, 0);
  return Math.round((sum / normalized.length) * 100) / 100;
}

export function situationLabel(avg: number | null): {
  label: string;
  tone: "green" | "amber" | "slate";
} {
  if (avg === null) return { label: "Sem notas", tone: "slate" };
  if (avg >= PASS_THRESHOLD) return { label: "Aprovado", tone: "green" };
  return { label: "Em recuperação", tone: "amber" };
}
