#!/usr/bin/env node
/**
 * Start de produção do EduGestão (Render).
 *
 * Roda em runtime, quando o disco persistente já está montado:
 *  1. prisma db push   — cria/atualiza as tabelas no banco (idempotente)
 *  2. seed do admin    — cria o administrador (se ADMIN_PASSWORD existir; idempotente)
 *  3. next start        — sobe o servidor
 *
 * Os passos 1-2 são "best-effort": se falharem, o servidor ainda sobe.
 */
import { execSync } from "node:child_process";

function run(cmd, { optional = false } = {}) {
  console.log(`\n$ ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    if (optional) {
      console.warn(`[start] passo opcional falhou (continuando): ${cmd}`);
    } else {
      throw err;
    }
  }
}

if (process.env.DATABASE_URL) {
  run("npx prisma db push --skip-generate --accept-data-loss", { optional: true });
  if (process.env.ADMIN_PASSWORD) {
    run("npx tsx prisma/seed.ts", { optional: true });
  } else {
    console.warn("[start] ADMIN_PASSWORD ausente — seed do admin ignorado.");
  }
} else {
  console.warn("[start] DATABASE_URL ausente — passos de banco ignorados.");
}

run("npx next start");
