import { createFileRoute, redirect } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { getCurrentUserFn, getMyContentAccessFn } from "@/lib/portal-db";
import { resolveDirectionByCourseTitle } from "@/lib/learning-content";

export const Route = createFileRoute("/theory")({
  beforeLoad: async () => {
    const user = await getCurrentUserFn();
    if (!user) throw redirect({ to: "/login" });
    if (user.role !== "student") throw redirect({ to: "/account" });
    const access = (await getMyContentAccessFn()) as Array<{ course_title: string; content_type: string; is_enabled: number }>;
    return { enabled: access.filter((x) => x.content_type === "theory" && x.is_enabled === 1) };
  },
  component: TheoryPage,
});

function TheoryPage() {
  const { enabled } = Route.useRouteContext();
  const mapped = enabled
    .map((row) => ({ row, direction: resolveDirectionByCourseTitle(row.course_title) }))
    .filter((x) => x.direction);

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur sm:p-10">
          <h1 className="font-display text-3xl font-extrabold">Теоретические материалы</h1>
          {mapped.length === 0 ? (
            <p className="mt-4 text-muted-foreground">Преподаватель пока не открыл вам доступ к теории.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {mapped.map(({ row, direction }, idx) => (
                <div key={`${row.course_title}-${idx}`} className="rounded-2xl bg-slate-50 p-5">
                  <h2 className="font-display text-xl font-bold">{direction!.title}</h2>
                  <div className="mt-3 grid gap-3">
                    {direction!.theory.map((block) => (
                      <div key={block.title} className="rounded-xl bg-white p-4">
                        <div className="font-semibold">{block.title}</div>
                        <p className="mt-1 text-sm text-muted-foreground">{block.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
