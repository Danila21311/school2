import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EnrollDialog } from "@/components/EnrollDialog";
import { PageShell } from "@/components/PageShell";
import { getCurrentUserFn, getMyCoursesFn } from "@/lib/portal-db";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ООО «Интерактив» — дистанционное обучение" },
      { name: "description", content: "Веб-платформа дистанционного обучения ООО «Интерактив»: онлайн-курсы, учебные материалы и заявки на обучение." },
      { property: "og:title", content: "ООО «Интерактив»" },
      { property: "og:description", content: "Современная платформа для дистанционного обучения и развития цифровых навыков." },
    ],
  }),
  component: Index,
});

const metrics = [
  { value: "24/7", label: "доступ к материалам" },
  { value: "5", label: "основных направлений" },
  { value: "25+", label: "учебных тем" },
];

const directions = [
  { title: "Бухгалтерский учет", text: "Первичная документация, налоговый учет, отчетность и учет заработной платы.", accent: "01" },
  { title: "Анализ и аудит", text: "Финансовый анализ, внутренний аудит, оценка рисков и подготовка отчетов.", accent: "02" },
  { title: "Охрана труда", text: "Требования охраны труда, инструктажи, оценка рисков и документация.", accent: "03" },
];

const advantages = [
  "личный кабинет слушателя",
  "структурированные модули курсов",
  "заявка на обучение онлайн",
  "отслеживание прогресса",
  "практические задания",
  "поддержка преподавателя",
];

const popularCourses = [
  { title: "Экологическая безопасность", level: "повышение квалификации", duration: "от 72 часов", lessons: "дистанционно" },
  { title: "Антитеррористическая защищенность", level: "повышение квалификации", duration: "от 40 часов", lessons: "дистанционно" },
  { title: "Специалист по пожарной профилактике", level: "профподготовка", duration: "от 256 часов", lessons: "дистанционно" },
];

const steps = [
  { title: "Выберите программу", text: "Ознакомьтесь с направлениями и подберите подходящий курс." },
  { title: "Оставьте заявку", text: "Заполните короткую форму, чтобы специалист связался с вами." },
  { title: "Начните обучение", text: "Получите доступ к материалам, заданиям и рекомендациям преподавателя." },
];

const reviews = [
  { name: "Анна Смирнова", role: "слушатель курса", text: "Понравилась структура обучения: короткие модули, понятные задания и быстрый доступ к материалам." },
  { name: "Игорь Павлов", role: "начинающий разработчик", text: "Удобно, что можно учиться в своём темпе и видеть прогресс по каждому разделу курса." },
  { name: "Мария Кузнецова", role: "дизайнер", text: "Платформа выглядит современной, а процесс записи на обучение занимает меньше минуты." },
];

const faqs = [
  { q: "Можно ли обучаться полностью дистанционно?", a: "Да, материалы доступны онлайн, а задания и прогресс фиксируются в личном кабинете." },
  { q: "Как подать заявку на курс?", a: "Нужно выбрать направление и заполнить короткую форму заявки. После этого специалист свяжется с вами." },
  { q: "Подходит ли обучение новичкам?", a: "Да, часть программ рассчитана на слушателей без предварительной подготовки." },
];

function Index() {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currentUser, setCurrentUser] = useState<null | { fullName: string; role: "student" | "teacher" | "admin" }>(null);
  const [myCourses, setMyCourses] = useState<Array<{ course_id: number; title: string; progress_percent: number }>>([]);

  useEffect(() => {
    let mounted = true;

    const loadUserProgress = async () => {
      try {
        const user = await getCurrentUserFn();
        if (!mounted || !user) {
          setCurrentUser(null);
          setMyCourses([]);
          return;
        }

        setCurrentUser({ fullName: user.fullName, role: user.role });

        if (user.role === "student") {
          const courses = (await getMyCoursesFn()) as Array<{ course_id: number; title: string; progress_percent: number }>;
          if (mounted) {
            setMyCourses(courses);
          }
        } else {
          setMyCourses([]);
        }
      } catch {
        if (mounted) {
          setCurrentUser(null);
          setMyCourses([]);
        }
      }
    };

    loadUserProgress();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-400/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.45),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.35),transparent_28%),linear-gradient(135deg,#020617,#0f172a_55%,#172554)]" />
          <div className="absolute right-8 top-8 hidden h-64 w-64 rounded-full border border-white/10 lg:block" />
          <div className="absolute right-20 top-20 hidden h-40 w-40 rounded-full border border-white/10 lg:block" />
          <div className="relative grid gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-14">
            <div className="grid content-center gap-7">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-sky-300" />
                Онлайн-обучение для современных специалистов
              </div>
              <div className="grid gap-5">
                <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl">
                  Учитесь онлайн на платформе ООО «Интерактив»
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                  Платформа объединяет образовательные программы, учебные материалы, заявки и контроль прогресса в едином удобном интерфейсе.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setEnrollOpen(true)}
                  className="rounded-2xl bg-white px-6 py-3 font-semibold text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-sky-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <i className="fi fi-rr-graduation-cap" aria-hidden="true" />
                    Записаться на обучение
                  </span>
                </button>
                <Link
                  to="/programs"
                  className="rounded-2xl border border-white/15 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  <span className="inline-flex items-center gap-2">
                    <i className="fi fi-rr-list-check" aria-hidden="true" />
                    Смотреть программы
                  </span>
                </Link>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-300">Личный кабинет</div>
                    <div className="font-display text-xl font-bold">
                      {currentUser ? `${currentUser.fullName}` : "Прогресс обучения"}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-200">Активно</div>
                </div>
                <div className="grid gap-4">
                  {currentUser?.role === "student" ? (
                    myCourses.length > 0 ? (
                      myCourses.slice(0, 3).map((course) => (
                        <div key={course.course_id} className="rounded-2xl bg-white/10 p-4">
                          <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium">{course.title}</span>
                            <span className="text-slate-300">{Math.round(Number(course.progress_percent || 0))}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-sky-300"
                              style={{ width: `${Math.max(0, Math.min(100, Number(course.progress_percent || 0)))}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl bg-white/10 p-4 text-sm text-slate-300">
                        У вас пока нет зачисленных курсов.
                      </div>
                    )
                  ) : (
                    <>
                      {["Основы веб-разработки", "UI/UX проектирование", "Итоговое задание"].map((item, index) => (
                        <div key={item} className="rounded-2xl bg-white/10 p-4">
                          <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium">{item}</span>
                            <span className="text-slate-300">{[72, 48, 24][index]}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-sky-300" style={{ width: `${[72, 48, 24][index]}%` }} />
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <div className="font-display text-2xl font-extrabold">{metric.value}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-300">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-7xl gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-7 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Направления</div>
          <h2 className="mt-3 font-display text-3xl font-extrabold">Выберите траекторию обучения</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Курсы сгруппированы по понятным направлениям, чтобы слушатель мог быстро подобрать программу под свой уровень и цель.
          </p>
          <div className="mt-7 grid gap-3">
            {directions.map((direction) => (
              <article key={direction.title} className="group grid gap-3 rounded-3xl bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-2xl bg-slate-950 px-3 py-2 font-display text-sm font-bold text-white">{direction.accent}</span>
                  <span className="text-2xl text-primary transition group-hover:translate-x-1">→</span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold">{direction.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{direction.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="grid gap-5">
          <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl shadow-slate-400/30 sm:p-8">
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">Популярные курсы</div>
            <h2 className="mt-3 font-display text-3xl font-extrabold">Программы, с которых удобно начать</h2>
            <div className="mt-6 grid gap-4">
              {popularCourses.map((course, index) => (
                <article key={course.title} className="grid gap-4 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur sm:grid-cols-[auto_1fr_auto] sm:items-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-300 font-display text-lg font-extrabold text-slate-950">0{index + 1}</div>
                  <div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                      <span>{course.level}</span>
                      <span>•</span>
                      <span>{course.duration}</span>
                      <span>•</span>
                      <span>{course.lessons}</span>
                    </div>
                    <h3 className="mt-2 font-display text-xl font-bold">{course.title}</h3>
                  </div>
                  <button onClick={() => setEnrollOpen(true)} className="w-fit rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-sky-50">
                    <span className="inline-flex items-center gap-2">
                      <i className="fi fi-rr-check" aria-hidden="true" />
                      Записаться
                    </span>
                  </button>
                </article>
              ))}
            </div>
          </div>
          <div className="grid gap-4 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-3xl bg-slate-50 p-5">
                <div className="mb-5 font-display text-4xl font-extrabold text-slate-200">0{index + 1}</div>
                <h3 className="font-display text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl rounded-[2rem] border border-white/70 bg-white/80 p-7 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Возможности платформы</div>
            <h2 className="mt-3 font-display text-3xl font-extrabold">Всё для организации дистанционного обучения</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Главная страница показывает пользователю, какие программы доступны, как подать заявку и какие инструменты будут использоваться во время обучения.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {advantages.map((advantage) => (
              <div key={advantage} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">✓</div>
                <div className="font-medium">{advantage}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-7xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl shadow-slate-400/30 sm:p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">Отзывы</div>
          <h2 className="mt-3 font-display text-3xl font-extrabold">Что говорят слушатели</h2>
          <div className="mt-6 grid gap-4">
            {reviews.map((review) => (
              <article key={review.name} className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="leading-7 text-slate-200">«{review.text}»</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-300 font-bold text-slate-950">{review.name.charAt(0)}</div>
                  <div>
                    <div className="font-semibold">{review.name}</div>
                    <div className="text-sm text-slate-400">{review.role}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] bg-white/80 p-7 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">FAQ</div>
          <h2 className="mt-3 font-display text-3xl font-extrabold">Частые вопросы</h2>
          <div className="mt-6 grid gap-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.q} className="overflow-hidden rounded-2xl bg-slate-50">
                  <button onClick={() => setOpenFaq(isOpen ? null : index)} className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-left font-semibold">
                    {faq.q}
                    <span className={`text-primary transition ${isOpen ? "rotate-45" : ""}`}>+</span>
                  </button>
                  {isOpen && <div className="px-5 pb-4 text-sm leading-6 text-muted-foreground">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl">
        <div className="grid gap-6 rounded-[2rem] bg-primary p-8 text-primary-foreground shadow-2xl shadow-blue-300/40 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-extrabold">Готовы выбрать программу?</h2>
            <p className="mt-3 max-w-2xl text-primary-foreground/80">
              Оставьте заявку, и специалист ООО «Интерактив» поможет подобрать подходящий формат обучения.
            </p>
          </div>
          <button
            onClick={() => setEnrollOpen(true)}
            className="w-fit rounded-2xl bg-white px-6 py-3 font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-sky-50"
          >
            <span className="inline-flex items-center gap-2">
              <i className="fi fi-rr-paper-plane" aria-hidden="true" />
              Оставить заявку
            </span>
          </button>
        </div>
      </section>

      <EnrollDialog open={enrollOpen} program="Общая заявка на обучение" onClose={() => setEnrollOpen(false)} />
    </PageShell>
  );
}
