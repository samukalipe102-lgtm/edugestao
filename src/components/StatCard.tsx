import Link from "next/link";

export function StatCard({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: string | number;
  icon?: string;
  href?: string;
}) {
  const inner = (
    <div className="card p-5 flex items-center gap-4 hover:shadow-md transition">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">
        {icon ?? "📊"}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}
