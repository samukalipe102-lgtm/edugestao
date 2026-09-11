"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type Result = { ok?: true; error?: string };

export async function acceptInvite(token: string, password: string): Promise<Result> {
  if (!password || password.length < 6) {
    return { error: "A senha deve ter ao menos 6 caracteres." };
  }
  const user = await prisma.user.findUnique({ where: { inviteToken: token } });
  if (!user) return { error: "Convite inválido ou já utilizado." };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      inviteToken: null,
      acceptedAt: new Date(),
      active: true,
    },
  });
  return { ok: true };
}
