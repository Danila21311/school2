import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from"react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { loginUserFn } from "@/lib/portal-db";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Вход в личный кабинет" },
      { name: "description", content: "Вход в личный кабинет платформы ООО «Интерактив»" },
    ],
  }),
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginUserFn({ data: { email, password } });
      // Fallback for dev/HMR cases where Set-Cookie header is not applied reliably.
      document.cookie = `user_id=${result.userId}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
      toast.success(`Добро пожаловать!`);
      window.location.href = "/account";
    } catch (err: any) {
      toast.error(err.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Левая колонка — форма */}
          <div className="flex items-center">
            <div className="w-full rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur sm:p-10">
              <h1 className="font-display text-3xl font-extrabold">Вход в кабинет</h1>
              <p className="mt-2 text-muted-foreground">Введите данные для входа в ваш личный кабинет</p>

              <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@interactive.ru"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Пароль</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary disabled:opacity-50"
                >
                  {loading ? "Вход..." : "Войти"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Нет аккаунта?{" "}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </div>

          {/* Информация */}
          <div className="flex items-center">
            <div className="w-full rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-400/30 sm:p-10">
              <h2 className="font-display text-2xl font-bold">Вход через Базу Данных</h2>
              <p className="mt-2 text-sm text-slate-300">
                Теперь система использует реальную базу данных SQLite.
                Убедитесь, что пользователь существует в БД (таблица users).
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <p>Для тестирования используйте пароль длиной 4+ символа.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

