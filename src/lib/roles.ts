// Perfis e permissões do EduGestão

export const ROLES = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  GUARDIAN: "GUARDIAN",
} as const;

export type Role = keyof typeof ROLES;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  TEACHER: "Professor(a)",
  STUDENT: "Aluno(a)",
  GUARDIAN: "Responsável",
};

export const STUDENT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativo",
  TRANSFERRED: "Transferido",
  INACTIVE: "Inativo",
};

export function isValidRole(role: string): role is Role {
  return role in ROLES;
}

// Rotas permitidas por perfil (prefixos). ADMIN acessa tudo.
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ["/admin", "/professor", "/aluno", "/responsavel"],
  TEACHER: ["/professor"],
  STUDENT: ["/aluno"],
  GUARDIAN: ["/responsavel"],
};

export function canAccess(role: string, pathname: string): boolean {
  if (role === "ADMIN") return true;
  const allowed = ROUTE_PERMISSIONS[role] ?? [];
  return allowed.some((prefix) => pathname.startsWith(prefix));
}

export function homeForRole(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TEACHER":
      return "/professor";
    case "STUDENT":
      return "/aluno";
    case "GUARDIAN":
      return "/responsavel";
    default:
      return "/login";
  }
}
