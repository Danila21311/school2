import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageShell, PageHero } from "@/components/PageShell";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Документы организации" },
      { name: "description", content: "Уставные, нормативные и отчётные документы образовательной организации." },
      { property: "og:title", content: "Документы" },
      { property: "og:description", content: "Перечень официальных документов организации." },
    ],
  }),
  component: Documents,
});

type Doc = { title: string; group: string; size: string; updated: string; type: "PDF" | "DOCX" | "XLSX" };

const docs: Doc[] = [
  { title: "Устав организации", group: "Учредительные", size: "420 КБ", updated: "2025-01-12", type: "PDF" },
  { title: "Свидетельство о регистрации", group: "Учредительные", size: "180 КБ", updated: "2024-09-04", type: "PDF" },
  { title: "Лицензия на образовательную деятельность", group: "Учредительные", size: "260 КБ", updated: "2024-11-20", type: "PDF" },
  { title: "Свидетельство об аккредитации", group: "Учредительные", size: "240 КБ", updated: "2024-11-20", type: "PDF" },
  { title: "Правила внутреннего распорядка", group: "Локальные акты", size: "310 КБ", updated: "2025-02-01", type: "PDF" },
  { title: "Положение об оплате труда", group: "Локальные акты", size: "190 КБ", updated: "2025-01-30", type: "DOCX" },
  { title: "Положение о приёме обучающихся", group: "Локальные акты", size: "220 КБ", updated: "2025-02-15", type: "PDF" },
  { title: "Положение о промежуточной аттестации", group: "Локальные акты", size: "210 КБ", updated: "2025-02-15", type: "PDF" },
  { title: "Отчёт о самообследовании", group: "Отчётность", size: "1.2 МБ", updated: "2025-03-01", type: "PDF" },
  { title: "Финансово-хозяйственная деятельность", group: "Отчётность", size: "640 КБ", updated: "2025-03-10", type: "XLSX" },
  { title: "План мероприятий по противодействию коррупции", group: "Отчётность", size: "150 КБ", updated: "2025-01-22", type: "PDF" },
  { title: "Образовательные программы", group: "Образовательные", size: "2.4 МБ", updated: "2025-02-28", type: "PDF" },
  { title: "Учебные планы", group: "Образовательные", size: "880 КБ", updated: "2025-02-28", type: "PDF" },
  { title: "Календарный учебный график", group: "Образовательные", size: "120 КБ", updated: "2025-02-28", type: "PDF" },
];

const groups = ["Все", "Учредительные", "Локальные акты", "Отчётность", "Образовательные"] as const;

function Documents() {
  const [group, setGroup] = useState<(typeof groups)[number]>("Все");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      docs.filter(
        (d) => (group === "Все" || d.group === group) && (!q || d.title.toLowerCase().includes(q.toLowerCase())),
      ),
    [group, q],
  );

  return (
    <PageShell>
      <PageHero eyebrow="Архив" title="Документы" description="Все официальные документы организации в свободном доступе." />

      <section className="mx-auto max-w-7xl mt-8">
        <div className="glass-strong p-5 sm:p-6 grid gap-4 lg:grid-cols-[1fr_auto] items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по документам..."
            className="glass rounded-xl px-4 py-3 text-sm bg-white/40 focus:bg-white/70 outline-none focus:ring-2 focus:ring-primary/40 transition"
            maxLength={100}
          />
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  group === g ? "glass-strong text-primary" : "glass hover:bg-white/60"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl mt-6 grid gap-3">
        {filtered.map((d) => (
          <article key={d.title} className="glass glass-hover p-5 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
            <div className="glass-strong rounded-xl w-14 h-14 grid place-items-center font-display font-bold text-primary">
              {d.type}
            </div>
            <div className="grid gap-0.5 min-w-0">
              <div className="font-semibold truncate">{d.title}</div>
              <div className="text-xs text-muted-foreground">
                {d.group} · {d.size} · обновлён {new Date(d.updated).toLocaleDateString("ru-RU")}
              </div>
            </div>
            <button
              onClick={() => toast.success(`Скачивание: ${d.title}`)}
              className="glass glass-hover px-4 py-2 rounded-xl text-sm font-semibold text-primary"
            >
              Скачать
            </button>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="glass p-8 text-center text-muted-foreground">Документы не найдены.</div>
        )}
      </section>
    </PageShell>
  );
}
