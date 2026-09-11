"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { acceptInvite } from "./actions";

export function AcceptInviteForm({ token, email }: { token: string; email: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }
    startTransition(async () => {
      const res = await acceptInvite(token, password);
      if (res?.error) {
        setError(res.error);
        return;
      }
      // Login automático após ativar
      await signIn("credentials", { email, password, callbackUrl: "/professor" });
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">E-mail</label>
        <input className="input" value={email} disabled />
      </div>
      <div>
        <label className="label">Nova senha *</label>
        <input
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div>
        <label className="label">Confirmar senha *</label>
        <input
          type="password"
          className="input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
        />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Ativando..." : "Ativar conta e entrar"}
      </button>
    </form>
  );
}
