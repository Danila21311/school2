import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { EnrollDialog } from "@/components/EnrollDialog";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Направления обучения" },
      { name: "description", content: "Профессиональные направления обучения: бухгалтерский учет, аудит, охрана труда, повышение квалификации и профессиональная подготовка." },
      { property: "og:title", content: "Направления обучения" },
      { property: "og:description", content: "Программы обучения для специалистов и организаций." },
    ],
  }),
  component: Programs,
});

type Direction = {
  title: string;
  subtitle: string;
  desc: string;
  accent: string;
  format: string;
  audience: string;
  items: string[];
};

const directions: Direction[] = [
  {
    title: "Бухгалтерский учет",
    subtitle: "Финансовый учет и отчетность",
    desc: "Программы для специалистов, которым необходимо уверенно работать с первичной документацией, отчетностью, налогами и внутренним учетом организации.",
    accent: "01",
    format: "дистанционно",
    audience: "бухгалтеры, экономисты, сотрудники организаций",
    items: ["Основы бухгалтерского учета", "Налоговый учет и отчетность", "Первичная документация", "Учет заработной платы", "Бухгалтерская отчетность организации"],
  },
  {
    title: "Анализ и аудит",
    subtitle: "Контроль, оценка и проверка деятельности",
    desc: "Направление ориентировано на подготовку специалистов, которые занимаются анализом финансовых показателей, проверкой документов и оценкой эффективности процессов.",
    accent: "02",
    format: "дистанционно",
    audience: "аудиторы, руководители, финансовые специалисты",
    items: ["Финансовый анализ", "Внутренний аудит", "Анализ хозяйственной деятельности", "Оценка рисков организации", "Подготовка аналитических отчетов"],
  },
  {
    title: "Охрана труда",
    subtitle: "Безопасность работников и производственных процессов",
    desc: "Курсы помогают изучить требования охраны труда, порядок организации инструктажей, оценку профессиональных рисков и документационное сопровождение.",
    accent: "03",
    format: "дистанционно",
    audience: "специалисты по охране труда, руководители, ответственные лица",
    items: ["Общие требования охраны труда", "Инструктажи и обучение работников", "Оценка профессиональных рисков", "Расследование несчастных случаев", "Документация по охране труда"],
  },
  {
    title: "Повышение квалификации",
    subtitle: "Актуализация профессиональных знаний",
    desc: "Программы повышения квалификации предназначены для специалистов, которым необходимо подтвердить или обновить компетенции в отдельных направлениях безопасности.",
    accent: "04",
    format: "дистанционно",
    audience: "действующие специалисты и руководители подразделений",
    items: ["Экологическая безопасность", "Радиационная безопасность", "Антитеррористическая защищенность", "Промышленная безопасность", "Документационное обеспечение требований безопасности"],
  },
  {
    title: "Профессиональная подготовка",
    subtitle: "Освоение новой профессиональной области",
    desc: "Программы профессиональной подготовки позволяют получить системные знания для работы в новой сфере или выполнения дополнительных трудовых функций.",
    accent: "05",
    format: "дистанционно",
    audience: "слушатели, меняющие профиль деятельности",
    items: ["Техносферная безопасность", "Специалист по пожарной профилактике", "Кадастровая деятельность", "Организация профилактических мероприятий", "Подготовка профессиональной документации"],
  },
];

const stats = [
  { value: "5", label: "крупных направлений" },
  { value: "25+", label: "учебных тем" },
  { value: "100%", label: "дистанционный формат" },
];

function Programs() {
  const [enrollFor, setEnrollFor] = useState<string | null>(null);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-400/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.45),transparent_32%),radial-gradient(circle_at_88%_12%,rgba(20,184,166,0.28),transparent_30%),linear-gradient(135deg,#020617,#0f172a_55%,#172554)]" />
          <div className="relative grid gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1fr_360px] lg:items-end lg:px-14">
            <div>
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100 backdrop-blur">
                Профессиональное обучение и повышение квалификации
              </div>
              <h1 className="mt-6 max-w-4xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">
                Направления обучения для специалистов и организаций
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
                ООО «Интерактив» предлагает дистанционные программы по бухгалтерскому учету, аудиту, охране труда, безопасности и профессиональной подготовке.
              </p>
            </div>
            <div className="grid gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <div className="font-display text-3xl font-extrabold text-sky-200">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-7 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-8">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Каталог</div>
            <h2 className="mt-3 font-display text-3xl font-extrabold">Основные направления</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Страница построена как каталог профессиональных программ. Каждое направление содержит тематические модули, по которым пользователь может оставить заявку на обучение.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {directions.slice(0, 4).map((direction) => (
              <a key={direction.title} href={`#${direction.accent}`} className="group rounded-3xl border border-white/70 bg-white/75 p-5 shadow-lg shadow-slate-200/60 backdrop-blur transition hover:-translate-y-1 hover:bg-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-2xl bg-slate-950 px-3 py-2 font-display text-sm font-bold text-white">{direction.accent}</span>
                  <span className="text-2xl text-primary transition group-hover:translate-x-1">→</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold">{direction.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{direction.subtitle}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-7xl gap-6">
        {directions.map((direction, index) => (
          <article
            key={direction.title}
            id={direction.accent}
            className={`scroll-mt-32 overflow-hidden rounded-[2rem] shadow-xl shadow-slate-200/60 ${
              index % 2 === 0 ? "bg-white/85 text-foreground" : "bg-slate-950 text-white"
            }`}
          >
            <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="grid content-between gap-8">
                <div>
                  <div className={`mb-5 inline-grid h-14 w-14 place-items-center rounded-2xl font-display text-lg font-extrabold ${
                    index % 2 === 0 ? "bg-primary text-primary-foreground" : "bg-sky-300 text-slate-950"
                  }`}>
                    {direction.accent}
                  </div>
                  <div className={`text-sm font-semibold uppercase tracking-[0.24em] ${
                    index % 2 === 0 ? "text-primary" : "text-sky-300"
                  }`}>
                    {direction.subtitle}
                  </div>
                  <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">{direction.title}</h2>
                  <p className={`mt-5 text-base leading-8 ${index % 2 === 0 ? "text-muted-foreground" : "text-slate-300"}`}>
                    {direction.desc}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className={`rounded-3xl p-5 ${index % 2 === 0 ? "bg-slate-50" : "bg-white/10"}`}>
                    <div className={index % 2 === 0 ? "text-sm text-muted-foreground" : "text-sm text-slate-400"}>Формат</div>
                    <div className="mt-1 font-semibold">{direction.format}</div>
                  </div>
                  <div className={`rounded-3xl p-5 ${index % 2 === 0 ? "bg-slate-50" : "bg-white/10"}`}>
                    <div className={index % 2 === 0 ? "text-sm text-muted-foreground" : "text-sm text-slate-400"}>Для кого</div>
                    <div className="mt-1 font-semibold">{direction.audience}</div>
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                {direction.items.map((item, itemIndex) => (
                  <div key={item} className={`grid grid-cols-[44px_1fr] gap-4 rounded-3xl p-5 ${
                    index % 2 === 0 ? "bg-slate-50" : "border border-white/10 bg-white/10"
                  }`}>
                    <div className={`grid h-11 w-11 place-items-center rounded-2xl font-display text-sm font-extrabold ${
                      index % 2 === 0 ? "bg-white text-primary shadow-sm" : "bg-sky-300 text-slate-950"
                    }`}>
                      {String(itemIndex + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold">{item}</h3>
                      <p className={`mt-1 text-sm leading-6 ${index % 2 === 0 ? "text-muted-foreground" : "text-slate-300"}`}>
                        Тематический модуль доступен в дистанционном формате и может быть включен в индивидуальную программу обучения.
                      </p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setEnrollFor(direction.title)}
                  className={`mt-2 rounded-2xl px-5 py-4 font-semibold transition hover:-translate-y-0.5 ${
                    index % 2 === 0 ? "bg-slate-950 text-white hover:bg-primary" : "bg-white text-slate-950 hover:bg-sky-50"
                  }`}
                >
                  Оставить заявку на направление
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="grid gap-6 rounded-[2rem] bg-primary p-8 text-primary-foreground shadow-2xl shadow-blue-300/40 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-extrabold">Нужна программа для организации?</h2>
            <p className="mt-3 max-w-2xl text-primary-foreground/80">
              Оставьте заявку, и специалист ООО «Интерактив» поможет подобрать направление обучения под требования вашей организации.
            </p>
          </div>
          <button
            onClick={() => setEnrollFor("Подбор программы обучения")}
            className="w-fit rounded-2xl bg-white px-6 py-3 font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-sky-50"
          >
            Получить консультацию
          </button>
        </div>
      </section>

      <EnrollDialog open={!!enrollFor} program={enrollFor} onClose={() => setEnrollFor(null)} />
    </PageShell>
  );
}
