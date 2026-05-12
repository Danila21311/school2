import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageShell } from "@/components/PageShell";
import { createUserFn } from "@/lib/portal-db";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Регистрация" },
      { name: "description", content: "Регистрация на платформе ООО «Интерактив»" },
    ],
  }),
  component: Register,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Укажите ФИО").max(100),
  email: z.string().trim().email("Некорректный e-mail").max(255),
  phone: z.string().trim().min(5, "Укажите телефон").max(30),
  password: z.string().min(4, "Минимум 4 символа").max(50),
});

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agree) {
      toast.error("Необходимо согласиться с условиями");
      return;
    }

    const parsed = schema.safeParse(formData);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Проверьте поля");
      return;
    }

    setLoading(true);

    try {
      const result = await createUserFn({
        data: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        },
      });

      // Fallback for dev/HMR cases where Set-Cookie header is not applied reliably.
      document.cookie = `user_id=${result.userId}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
      toast.success("Регистрация успешна! Добро пожаловать!");
      window.location.href = "/account";
    } catch (err: any) {
      toast.error(err.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur sm:p-10">
          <h1 className="text-center font-display text-3xl font-extrabold">Создать аккаунт</h1>
          <p className="mt-2 text-center text-muted-foreground">
            Зарегистрируйтесь для доступа к курсам и обучению
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">ФИО</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Иванов Иван Иванович"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">E-mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.ru"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Телефон</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Пароль</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Минимум 4 символа"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>

            <label className="mt-2 flex items-start gap-3">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">
                Я согласен с{" "}
                <a href="#" className="text-primary hover:underline">
                  условиями использования
                </a>{" "}
                и{" "}
                <a href="#" className="text-primary hover:underline">
                  политикой конфиденциальности
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary disabled:opacity-50"
            >
              {loading ? "Создание аккаунта..." : "Зарегистрироваться"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
