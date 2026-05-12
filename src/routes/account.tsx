import { createFileRoute, redirect } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { getCurrentUserFn, getMyCoursesFn } from "@/lib/portal-db";

const roleCapabilities = {
  student: [
    "Доступ к личному кабинету и своим курсам",
    "Просмотр учебных материалов по зачисленным курсам",
    "История заявок и результаты выполненных заданий",
    "Изменение настроек своей учетной записи",
  ],
  teacher: [
    "Доступ к материалам закрепленных курсов",
    "Просмотр списка слушателей и их прогресса",
    "Проверка заданий и обратная связь",
    "Размещение учебных материалов в своих курсах",
  ],
  admin: [
    "Управление пользователями и ролями",
    "Управление образовательными программами и материалами",
    "Обработка заявок на обучение",
    "Доступ к журналу действий пользователей",
  ],
} as const;

export const Route = createFileRoute("/account")({
  beforeLoad: async () => {
    const user = await getCurrentUserFn();
    if (!user) {
      throw redirect({ to: "/login" });
    }

    let courses: Array<{
      course_id: number;
      title: string;
      progress_percent: number;
      enrollment_status: string;
      teacher_name: string | null;
    }> = [];

    if (user.role === "student") {
      courses = (await getMyCoursesFn()) as typeof courses;
    }

    return { user, courses };
  },
  component: AccountPage,
});

function AccountPage() {
  const { user, courses } = Route.useRouteContext();
  const capabilities = roleCapabilities[user.role] ?? [];
  const avgProgress = courses.length
    ? Math.round(courses.reduce((acc, item) => acc + Number(item.progress_percent || 0), 0) / courses.length)
    : 0;
  const completedCourses = courses.filter((course) => course.enrollment_status === "completed").length;

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur sm:p-10">
          <h1 className="font-display text-3xl font-extrabold">Личный кабинет</h1>
          <p className="mt-2 text-muted-foreground">
            Вы вошли как <span className="font-semibold">{user.fullName}</span> ({user.role})
          </p>

          {user.role === "student" && (
            <>
              <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-300">Личный кабинет</div>
                    <div className="font-display text-2xl font-bold">Прогресс обучения</div>
                  </div>
                  <div className="rounded-2xl bg-emerald-400/15 px-3 py-1 text-sm font-semibold text-emerald-200">
                    Активно
                  </div>
                </div>

                {courses.length === 0 ? (
                  <div className="rounded-2xl bg-white/10 p-4 text-sm text-slate-200">
                    У вас пока нет активных курсов. После зачисления прогресс появится здесь.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {courses.map((course) => (
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
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="font-display text-3xl font-extrabold">{courses.length}</div>
                  <div className="mt-1 text-sm text-muted-foreground">моих курсов</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="font-display text-3xl font-extrabold">{avgProgress}%</div>
                  <div className="mt-1 text-sm text-muted-foreground">средний прогресс</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="font-display text-3xl font-extrabold">{completedCourses}</div>
                  <div className="mt-1 text-sm text-muted-foreground">завершено курсов</div>
                </div>
              </div>
            </>
          )}

          <div className="mt-6 grid gap-3">
            {capabilities.map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm">
                {item}
              </div>
            ))}
          </div>
          {user.role === "student" && (
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <Link to="/theory" className="rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white">
                Теория
              </Link>
              <Link to="/test" className="rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white">
                Тест
              </Link>
              <Link to="/final-test" className="rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white">
                Итоговый тест
              </Link>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
