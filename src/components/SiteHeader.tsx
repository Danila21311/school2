import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCurrentUserFn, logoutUserFn } from "@/lib/portal-db";

const nav = [
  { to: "/", label: "Главная", icon: "fi fi-rr-house-blank" },
  { to: "/programs", label: "Направления", icon: "fi fi-rr-book-alt" },
  { to: "/ai", label: "ИИ-помощник", icon: "fi fi-rr-comment-alt" },
  { to: "/map", label: "Контакты", icon: "fi fi-rr-marker" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<null | { fullName: string; role: "student" | "teacher" | "admin" }>(null);

  useEffect(() => {
    let mounted = true;
    getCurrentUserFn()
      .then((currentUser) => {
        if (mounted) {
          setUser(currentUser ? { fullName: currentUser.fullName, role: currentUser.role } : null);
        }
      })
      .catch(() => {
        if (mounted) setUser(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logoutUserFn();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="glass-nav mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[1.75rem] px-4 py-3 sm:px-5">
        <Link to="/" className="group flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-300/60 transition group-hover:-translate-y-0.5">
            <span className="font-display text-sm font-extrabold">ИН</span>
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="font-display text-base font-extrabold">ООО «Интерактив»</div>
            <div className="text-xs font-medium text-muted-foreground">платформа дистанционного обучения</div>
          </div>
        </Link>
        <nav className="hidden justify-center gap-2 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-foreground/70 transition hover:bg-white/70 hover:text-foreground"
              activeProps={{ className: "rounded-xl bg-white px-4 py-2 text-sm font-bold text-primary shadow-md shadow-slate-200/70" }}
            >
              <span className="inline-flex items-center gap-2">
                <i className={n.icon} aria-hidden="true" />
                {n.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link
                to="/account"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
              >
                <span className="inline-flex items-center gap-2">
                  <i className="fi fi-rr-user" aria-hidden="true" />
                  Кабинет
                </span>
              </Link>
              {user.role === "teacher" && (
                <Link
                  to="/teacher"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
                >
                  <span className="inline-flex items-center gap-2">
                    <i className="fi fi-rr-chalkboard-user" aria-hidden="true" />
                    Кабинет преподавателя
                  </span>
                </Link>
              )}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
                >
                  <span className="inline-flex items-center gap-2">
                    <i className="fi fi-rr-dashboard-panel" aria-hidden="true" />
                    Админ-панель
                  </span>
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-300/70 transition hover:-translate-y-0.5 hover:bg-primary"
              >
                <span className="inline-flex items-center gap-2">
                  <i className="fi fi-rr-exit" aria-hidden="true" />
                  Выйти
                </span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
              >
                <span className="inline-flex items-center gap-2">
                  <i className="fi fi-rr-sign-in-alt" aria-hidden="true" />
                  Войти
                </span>
              </Link>
              <Link
                to="/register"
                className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-300/70 transition hover:-translate-y-0.5 hover:bg-primary"
              >
                <span className="inline-flex items-center gap-2">
                  <i className="fi fi-rr-user-add" aria-hidden="true" />
                  Регистрация
                </span>
              </Link>
            </>
          )}
        </div>
        <button
          className="glass rounded-xl px-3 py-2 text-sm font-semibold md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Меню"
        >
          Меню
        </button>
      </div>
      {open && (
        <div className="glass mx-auto mt-2 grid max-w-7xl gap-1 p-2 md:hidden">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/60"
              activeProps={{ className: "rounded-xl bg-white/70 px-4 py-3 text-sm font-semibold text-primary" }}
            >
              <span className="inline-flex items-center gap-2">
                <i className={n.icon} aria-hidden="true" />
                {n.label}
              </span>
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-200/50 pt-2">
            {user ? (
              <>
                <Link
                  to="/account"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-white/60"
                >
                  Кабинет
                </Link>
                {user.role === "teacher" && (
                  <Link
                    to="/teacher"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-white/60"
                  >
                    Кабинет преподавателя
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-white/60"
                  >
                    Админ-панель
                  </Link>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    setOpen(false);
                    await handleLogout();
                  }}
                  className="rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-white/60"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
