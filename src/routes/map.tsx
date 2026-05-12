import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Контакты" },
      { name: "description", content: "Контактная информация, адрес и форма обратной связи ООО «Интерактив»." },
      { property: "og:title", content: "Контакты" },
      { property: "og:description", content: "Как связаться с ООО «Интерактив»." },
    ],
  }),
  component: MapPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Минимум 2 символа").max(100),
  email: z.string().trim().email("Некорректный e-mail").max(255),
  message: z.string().trim().min(5, "Минимум 5 символов").max(1000),
});

const contacts = [
  { label: "Телефон", value: "+7 (000) 000-00-00", text: "консультации по программам обучения" },
  { label: "E-mail", value: "info@interactive.ru", text: "прием заявок и обращений слушателей" },
  { label: "Адрес", value: "г. Оренбург, Шарлыкское шоссе, 1к2", text: "офис ООО «Интерактив»" },
];

const schedule = [
  { day: "Понедельник — пятница", time: "08:00 — 18:00" },
  { day: "Суббота", time: "09:00 — 14:00" },
  { day: "Воскресенье", time: "выходной" },
];

function MapPage() {
  const [pending, setPending] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      message: fd.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Проверьте поля");
      return;
    }
    setPending(true);
    try {
      const arr = JSON.parse(localStorage.getItem("contacts") || "[]");
      arr.push({ ...parsed.data, createdAt: new Date().toISOString() });
      localStorage.setItem("contacts", JSON.stringify(arr));
      toast.success("Сообщение отправлено. Мы свяжемся с вами.");
      (e.target as HTMLFormElement).reset();
    } finally {
      setPending(false);
    }
  };

  const inputCls = "rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm w-full shadow-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-primary/40";

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-400/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(59,130,246,0.5),transparent_32%),radial-gradient(circle_at_86%_8%,rgba(20,184,166,0.32),transparent_28%),linear-gradient(135deg,#020617,#0f172a_55%,#172554)]" />
          <div className="relative grid gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1fr_420px] lg:items-end lg:px-14">
            <div>
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100 backdrop-blur">
                Контакты ООО «Интерактив»
              </div>
              <h1 className="mt-6 max-w-4xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">
                Свяжитесь с нами удобным способом
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
                Ответим на вопросы по направлениям обучения, поможем подобрать программу и подскажем порядок подачи заявки на дистанционное обучение.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <div className="text-sm text-slate-300">Быстрая консультация</div>
              <div className="mt-2 font-display text-3xl font-extrabold">1 рабочий день</div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                После отправки формы специалист свяжется с вами для уточнения программы и формата обучения.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-7xl gap-4 md:grid-cols-3">
        {contacts.map((item) => (
          <article key={item.label} className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">{item.label}</div>
            <div className="mt-4 font-display text-2xl font-extrabold">{item.value}</div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto mt-8 grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-3 shadow-2xl shadow-slate-400/30">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
            <iframe
              title="Карта"
              src="https://www.openstreetmap.org/export/embed.html?bbox=55.0712%2C51.7936%2C55.1712%2C51.8936&layer=mapnik&marker=51.843568%2C55.121219"
              className="block h-[520px] w-full"
              loading="lazy"
            />
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-7 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-8">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Режим работы</div>
            <h2 className="mt-3 font-display text-3xl font-extrabold">Когда можно обратиться</h2>
            <div className="mt-6 grid gap-3">
              {schedule.map((item) => (
                <div key={item.day} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                  <span className="font-medium">{item.day}</span>
                  <span className="font-semibold text-primary">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-primary p-7 text-primary-foreground shadow-2xl shadow-blue-300/40 sm:p-8">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-foreground/70">Для слушателей</div>
            <h2 className="mt-3 font-display text-3xl font-extrabold">Поможем выбрать курс</h2>
            <p className="mt-4 leading-7 text-primary-foreground/80">
              Если вы не знаете, какое направление выбрать, отправьте обращение. Мы уточним цель обучения и предложим подходящую программу.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-7 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Как проходит обращение</div>
          <h2 className="mt-3 font-display text-3xl font-extrabold">Три простых шага</h2>
          <div className="mt-6 grid gap-4">
            {["Вы отправляете сообщение через форму", "Специалист уточняет задачу и направление обучения", "Вы получаете консультацию и можете подать заявку"].map((step, index) => (
              <div key={step} className="grid grid-cols-[48px_1fr] gap-4 rounded-3xl bg-slate-50 p-5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 font-display font-extrabold text-primary">
                  0{index + 1}
                </div>
                <div className="self-center font-medium">{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-7 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-8">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Обратная связь</div>
          <h2 className="mt-3 font-display text-3xl font-extrabold">Напишите нам</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Заполните форму, и мы ответим в течение рабочего дня. Сообщение сохранится в локальном хранилище браузера для демонстрации работы формы.
          </p>
          <form onSubmit={submit} className="grid gap-3">
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-foreground/70">Имя</span>
              <input name="name" className={inputCls} maxLength={100} placeholder="Как к вам обращаться" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-foreground/70">E-mail</span>
              <input name="email" type="email" className={inputCls} maxLength={255} placeholder="you@example.ru" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold text-foreground/70">Сообщение</span>
              <textarea name="message" rows={5} className={inputCls} maxLength={1000} placeholder="Ваш вопрос или комментарий" />
            </label>
            <button disabled={pending} className="glass glass-hover px-4 py-3 rounded-xl font-semibold text-primary disabled:opacity-50">
              {pending ? "Отправка..." : "Отправить сообщение"}
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
