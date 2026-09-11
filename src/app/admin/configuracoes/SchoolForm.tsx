"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSchool } from "./actions";

type School = {
  name: string;
  code: string | null;
  state: string | null;
  educationSecretary: string | null;
  municipality: string | null;
  address: string | null;
  contact: string | null;
  logoUrl: string | null;
  schoolYear: string | null;
  directorName: string | null;
  secretaryName: string | null;
} | null;

export function SchoolForm({ school }: { school: School }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setMsg("");
    startTransition(async () => {
      const res = await saveSchool(fd);
      if (res?.error) setMsg(res.error);
      else {
        setMsg("Configurações salvas com sucesso.");
        router.refresh();
      }
    });
  }

  const field = (
    name: string,
    label: string,
    defaultValue?: string | null,
    type = "text"
  ) => (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        className="input"
      />
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="card p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="name">
            Nome da escola *
          </label>
          <input
            id="name"
            name="name"
            defaultValue={school?.name ?? ""}
            className="input"
            required
          />
        </div>
        {field("code", "Código da escola", school?.code)}
        {field("schoolYear", "Ano letivo", school?.schoolYear)}
        {field("state", "Estado", school?.state)}
        {field("municipality", "Município", school?.municipality)}
        {field("educationSecretary", "Secretaria de Educação", school?.educationSecretary)}
        {field("contact", "Contato (telefone/e-mail)", school?.contact)}
        <div className="sm:col-span-2">
          {field("address", "Endereço", school?.address)}
        </div>
        <div className="sm:col-span-2">
          {field("logoUrl", "URL do logotipo", school?.logoUrl)}
        </div>
        {field("directorName", "Diretor(a)", school?.directorName)}
        {field("secretaryName", "Secretário(a) de Escola", school?.secretaryName)}
      </div>

      {msg && (
        <p
          className={
            msg.includes("sucesso")
              ? "rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700"
              : "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          }
        >
          {msg}
        </p>
      )}

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Salvando..." : "Salvar configurações"}
        </button>
      </div>
    </form>
  );
}
