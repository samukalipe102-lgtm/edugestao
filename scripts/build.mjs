#!/usr/bin/env node
/**
 * Build de produção do EduGestão.
 *  1. prisma generate  — gera o Prisma Client
 *  2. next build        — compila a aplicação
 *
 * A criação das tabelas e do admin acontece no START (scripts/start.mjs),
 * quando o disco persistente já está montado.
 */
import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

run("npx prisma generate");
run("npx next build");
