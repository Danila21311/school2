import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { getCurrentUserFn, getMyContentAccessFn } from "@/lib/portal-db";
import { resolveDirectionByCourseTitle } from "@/lib/learning-content";

export const Route = createFileRoute("/final-test")({
  beforeLoad: async () => {
    const user = await getCurrentUserFn();
    if (!user) throw redirect({ to: "/login" });
    if (user.role !== "student") throw redirect({ to: "/account" });
    const access = (await getMyContentAccessFn()) as Array<{ course_title: string; content_type: string; is_enabled: number }>;
    return { enabled: access.filter((x) => x.content_type === "final_test" && x.is_enabled === 1) };
  },
  component: FinalTestPage,
});

function FinalTestPage() {
  const { enabled } = Route.useRouteContext();
  const available = useMemo(
    () =>
      enabled
        .map((row) => ({ row, direction: resolveDirectionByCourseTitle(row.course_title) }))
        .filter((x) => x.direction),
    [enabled],
  );
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const selected = available[selectedIdx];
  const questions = selected?.direction?.finalTest ?? [];

  const submit = () => {
    if (!selected?.direction) return;
    if (questions.length === 0) return;
    const score = questions.reduce((acc, q) => (answers[q.id] === q.correctIndex ? acc + 1 : acc), 0);
    const passed = score >= Math.ceil(questions.length * 0.7);
    toast.success(`Итог: ${score}/${questions.length}. ${passed ? "Тест пройден" : "Нужно пересдать"}`);
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur sm:p-10">
          <h1 className="font-display text-3xl font-extrabold">Итоговые тесты</h1>
          {available.length === 0 ? (
            <p className="mt-4 text-muted-foreground">Преподаватель пока не открыл вам доступ к итоговому тесту.</p>
          ) : (
            <>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {available.map((item, idx) => (
                  <button
                    key={`${item.row.course_title}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedIdx(idx);
                      setAnswers({});
                    }}
                    className={`rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                      selectedIdx === idx ? "bg-slate-950 text-white" : "bg-slate-100"
                    }`}
                  >
                    {item.direction!.title}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-3">
                {questions.map((q) => (
                  <div key={q.id} className="rounded-xl bg-slate-50 p-4">
                    <div className="font-semibold">{q.question}</div>
                    <div className="mt-2 grid gap-2">
                      {q.options.map((option, index) => (
                        <label key={option} className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={q.id}
                            checked={answers[q.id] === index}
                            onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: index }))}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={submit} className="rounded-xl bg-primary px-4 py-3 font-semibold text-white">
                  Завершить итоговый тест
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
