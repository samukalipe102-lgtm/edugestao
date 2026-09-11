import { WEEKDAYS } from "@/lib/teacher";

export type CalendarEntry = {
  weekday: number;
  startTime: string;
  endTime: string;
  lessonNumber: number;
  classGroup: string;
  subject: string;
  teacher?: string;
};

export function WeeklyCalendar({ entries }: { entries: CalendarEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-slate-500">
        Nenhum horário cadastrado. A grade é definida em Horários.
      </div>
    );
  }

  const days = WEEKDAYS.filter((w) => w.value <= 6).map((w) => ({
    ...w,
    items: entries
      .filter((e) => e.weekday === w.value)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {days.map((d) => (
        <div key={d.value} className="card p-4">
          <h3 className="font-semibold text-slate-800 mb-3 text-sm">{d.label}</h3>
          {d.items.length === 0 ? (
            <p className="text-xs text-slate-400">Sem aulas</p>
          ) : (
            <ul className="space-y-2">
              {d.items.map((e, i) => (
                <li key={i} className="rounded-lg bg-brand-50 p-2 text-xs">
                  <p className="font-medium text-brand-800">{e.startTime}–{e.endTime}</p>
                  <p className="text-slate-700">{e.subject}</p>
                  <p className="text-slate-500">{e.classGroup}</p>
                  {e.teacher && <p className="text-slate-400">{e.teacher}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
