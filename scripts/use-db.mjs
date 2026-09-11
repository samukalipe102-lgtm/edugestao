#!/usr/bin/env node
/**
 * Alterna o provider do banco no prisma/schema.prisma entre SQLite (dev local)
 * e PostgreSQL (produção). O Prisma exige que o provider seja literal no schema
 * antes de gerar o client, então usamos este utilitário para trocar com segurança.
 *
 * Uso:
 *   node scripts/use-db.mjs postgres   # produção (Vercel/Neon/etc.)
 *   node scripts/use-db.mjs sqlite     # desenvolvimento local (padrão)
 *
 * Não altera nenhuma credencial: a conexão vem sempre de DATABASE_URL (env).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const target = (process.argv[2] || "").toLowerCase();
const map = { postgres: "postgresql", postgresql: "postgresql", sqlite: "sqlite" };
const provider = map[target];

if (!provider) {
  console.error('Uso: node scripts/use-db.mjs <postgres|sqlite>');
  process.exit(1);
}

const schemaPath = join(dirname(fileURLToPath(import.meta.url)), "..", "prisma", "schema.prisma");
const original = readFileSync(schemaPath, "utf8");

const updated = original.replace(
  /datasource db \{\s*provider\s*=\s*"(sqlite|postgresql)"/,
  (m) => m.replace(/"(sqlite|postgresql)"/, `"${provider}"`)
);

if (updated === original) {
  console.log(`Provider já está como "${provider}" (ou datasource não encontrado).`);
} else {
  writeFileSync(schemaPath, updated);
  console.log(`Provider do banco alterado para "${provider}".`);
}

console.log("Lembre-se de definir DATABASE_URL para o banco correspondente e rodar:");
console.log("  npx prisma generate && npx prisma db push");
