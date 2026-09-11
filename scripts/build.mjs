#!/usr/bin/env node
/**
 * Build de produção do EduGestão (usado pela Vercel).
 *
 * Ordem:
 *  1. prisma generate            (sempre)
 *  2. prisma db push             (só se DATABASE_URL existir) — cria/atualiza as tabelas
 *  3. seed do admin              (só se DATABASE_URL + ADMIN_PASSWORD existirem) — idempotente
 *  4. next build                 (sempre)
 *
 * Os passos de banco são "best-effort": se falharem (ex.: banco indisponível no
 * momento do build), o build do Next ainda continua, evitando travar o deploy.
 * A aplicação em runtime funcionará assim que o banco estiver acessível.
 */
import { execSync } from "node:child_process";

function run(cmd, { optional = false } = {}) {
  console.log(`\n$ ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    if (optional) {
      console.warn(`[build] passo opcional falhou (continuando): ${cmd}`);
    } else {
      throw err;
    }
  }
}

const hasDb = !!process.env.DATABASE_URL;
const hasAdminPassword = !!process.env.ADMIN_PASSWORD;

run("npx prisma generate");

if (hasDb) {
  // aplica o schema no banco (cria tabelas se ainda não existirem)
  run("npx prisma db push --skip-generate --accept-data-loss", { optional: true });

  if (hasAdminPassword) {
    // cria/garante o administrador inicial (idempotente: não recria se já existe)
    run("npx tsx prisma/seed.ts", { optional: true });
  } else {
    console.warn("[build] ADMIN_PASSWORD ausente — seed do admin ignorado.");
  }
} else {
  console.warn("[build] DATABASE_URL ausente — passos de banco ignorados (apenas next build).");
}

run("npx next build");
