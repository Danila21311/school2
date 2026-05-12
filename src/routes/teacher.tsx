import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import {
  getCurrentUserFn,
  getTeacherContentAccessFn,
  getTeacherStudentsFn,
  setStudentContentAccessFn,
} from "@/lib/portal-db";

type TeacherStudent = {
  user_id: number;
  full_name: string;
  email: string;
  course_id: number;
  course_title: string;
  progress_percent: number;
  enrollment_status: string;
};

type AccessRow = {
  user_id: number;
  course_id: number;
  content_type: "theory" | "test" | "final_test";
  is_enabled: number;
};

const contentTypes: Array<{ key: "theory" | "test" | "final_test"; label: string }> = [
  { key: "theory", label: "Теория" },
  { key: "test", label: "Тест" },
  { key: "final_test", label: "Итоговый тест" },
];

export const Route = createFileRoute("/teacher")({
  beforeLoad: async () => {
    const user = await getCurrentUserFn();
    if (!user) throw redirect({ to: "/login" });
    if (user.role !== "teacher" && user.role !== "admin") throw redirect({ to: "/account" });

    const students = (await getTeacherStudentsFn()) as TeacherStudent[];
    const accessRows = (await getTeacherContentAccessFn()) as AccessRow[];
    return { students, accessRows };
  },
  component: TeacherPage,
});

function TeacherPage() {
  const { students: initialStudents, accessRows: initialAccessRows } = Route.useRouteContext();
  const [students] = useState(initialStudents);
  const [accessRows, setAccessRows] = useState(initialAccessRows);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return students.map((item) => {
      const key = `${item.user_id}-${item.course_id}`;
      const access = accessRows.filter((a) => a.user_id === item.user_id && a.course_id === item.course_id);
      return { key, ...item, access };
    });
  }, [students, accessRows]);

  const isEnabled = (studentId: number, courseId: number, type: AccessRow["content_type"]) =>
    accessRows.some((row) => row.user_id === studentId && row.course_id === courseId && row.content_type === type && row.is_enabled === 1);

  const toggleAccess = async (studentId: number, courseId: number, contentType: AccessRow["content_type"], nextEnabled: boolean) => {
    const key = `${studentId}-${courseId}-${contentType}`;
    setLoadingKey(key);
    try {
      await setStudentContentAccessFn({ data: { studentId, courseId, contentType, enabled: nextEnabled } });
      setAccessRows((prev) => {
        const without = prev.filter((row) => !(row.user_id === studentId && row.course_id === courseId && row.content_type === contentType));
        return [...without, { user_id: studentId, course_id: courseId, content_type: contentType, is_enabled: nextEnabled ? 1 : 0 }];
      });
      toast.success("Доступ обновлен");
    } catch (err: any) {
      toast.error(err?.message || "Не удалось обновить доступ");
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur sm:p-10">
          <h1 className="font-display text-3xl font-extrabold">Кабинет преподавателя</h1>
          <p className="mt-2 text-muted-foreground">
            Управляйте доступом слушателей к материалам и отслеживайте их прогресс по вашим курсам.
          </p>

          <div className="mt-8 grid gap-4">
            {grouped.length === 0 && (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-muted-foreground">У вас пока нет закрепленных слушателей.</div>
            )}
            {grouped.map((row) => (
              <article key={row.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{row.full_name}</div>
                    <div className="text-sm text-muted-foreground">{row.email}</div>
                    <div className="mt-1 text-sm">Курс: {row.course_title}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Прогресс</div>
                    <div className="font-display text-2xl font-extrabold">{Math.round(Number(row.progress_percent || 0))}%</div>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(0, Math.min(100, Number(row.progress_percent || 0)))}%` }}
                  />
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {contentTypes.map((contentType) => {
                    const enabled = isEnabled(row.user_id, row.course_id, contentType.key);
                    const key = `${row.user_id}-${row.course_id}-${contentType.key}`;
                    return (
                      <button
                        key={contentType.key}
                        type="button"
                        disabled={loadingKey === key}
                        onClick={() => toggleAccess(row.user_id, row.course_id, contentType.key, !enabled)}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                          enabled ? "bg-emerald-600 text-white" : "bg-white text-slate-700"
                        }`}
                      >
                        {contentType.label}: {enabled ? "Открыто" : "Закрыто"}
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
