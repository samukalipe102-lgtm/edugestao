import type { NavItem } from "@/components/DashboardShell";

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/turmas", label: "Turmas", icon: "🏫" },
  { href: "/admin/alunos", label: "Alunos", icon: "🎓" },
  { href: "/admin/professores", label: "Professores", icon: "👩‍🏫" },
  { href: "/admin/disciplinas", label: "Disciplinas", icon: "📘" },
  { href: "/admin/notas", label: "Notas & Avaliações", icon: "📝" },
  { href: "/admin/frequencia", label: "Frequência", icon: "✅" },
  { href: "/admin/horarios", label: "Horários", icon: "🕒" },
  { href: "/admin/calendario", label: "Calendário", icon: "📅" },
  { href: "/admin/planejamento", label: "Planejamento", icon: "🗂️" },
  { href: "/admin/bncc", label: "BNCC", icon: "📚" },
  { href: "/admin/relatorios", label: "Relatórios", icon: "📊" },
  { href: "/admin/documentos", label: "Documentos", icon: "📄" },
  { href: "/admin/configuracoes", label: "Configurações da Escola", icon: "⚙️" },
];

export const TEACHER_NAV: NavItem[] = [
  { href: "/professor", label: "Dashboard", icon: "🏠" },
  { href: "/professor/turmas", label: "Minhas Turmas", icon: "🏫" },
  { href: "/professor/diario", label: "Diário de Classe", icon: "📔" },
  { href: "/professor/planejamento", label: "Planejamento", icon: "🗂️" },
  { href: "/professor/aulas", label: "Registros de Aula", icon: "📝" },
  { href: "/professor/notas", label: "Notas", icon: "🔢" },
  { href: "/professor/frequencia", label: "Frequência", icon: "✅" },
  { href: "/professor/calendario", label: "Calendário", icon: "📅" },
  { href: "/professor/materiais", label: "Materiais", icon: "📎" },
];

export const STUDENT_NAV: NavItem[] = [
  { href: "/aluno", label: "Dashboard", icon: "🏠" },
  { href: "/aluno/notas", label: "Minhas Notas", icon: "📝" },
  { href: "/aluno/frequencia", label: "Frequência", icon: "✅" },
  { href: "/aluno/calendario", label: "Calendário", icon: "📅" },
];

export const GUARDIAN_NAV: NavItem[] = [
  { href: "/responsavel", label: "Dashboard", icon: "🏠" },
  { href: "/responsavel/notas", label: "Notas", icon: "📝" },
  { href: "/responsavel/frequencia", label: "Frequência", icon: "✅" },
];
