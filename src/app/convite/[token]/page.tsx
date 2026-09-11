import { prisma } from "@/lib/prisma";
import { AcceptInviteForm } from "./AcceptInviteForm";
import { ROLE_LABELS } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: { token: string } }) {
  const user = await prisma.user.findUnique({ where: { inviteToken: params.token } });

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white text-2xl font-bold shadow-lg">
            E
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-800">EduGestão</h1>
          <p className="text-sm text-slate-500">Ativação de conta</p>
        </div>

        {!user ? (
          <div className="card p-6 text-center">
            <p className="text-slate-700 font-medium">Convite inválido ou já utilizado.</p>
            <a href="/login" className="mt-4 inline-block text-brand-600 hover:underline">
              Ir para o login
            </a>
          </div>
        ) : (
          <div className="card p-6 space-y-4">
            <div className="text-sm text-slate-600">
              <p>
                Olá, <b>{user.name}</b>!
              </p>
              <p>
                Você foi convidado(a) como <b>{ROLE_LABELS[user.role] ?? user.role}</b>. Defina sua
                senha para acessar.
              </p>
            </div>
            <AcceptInviteForm token={params.token} email={user.email} />
          </div>
        )}
      </div>
    </div>
  );
}
