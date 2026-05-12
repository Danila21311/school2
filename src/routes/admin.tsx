import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import {
  deleteStudentFn,
  getAllUsersFn,
  getCurrentUserFn,
  getEnrollmentRequestsFn,
  processEnrollmentRequestFn,
  promoteUserToTeacherFn,
} from "@/lib/portal-db";
import type { UserRole } from "@/portal-db-types";

type AdminUserRow = {
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role_name: UserRole;
};
type EnrollmentRequestRow = {
  request_id: number;
  user_id: number | null;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string | null;
  comment: string | null;
  request_status: "new" | "approved" | "rejected" | "completed";
  created_at: string;
  course_id: number;
  course_title: string;
};

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const user = await getCurrentUserFn();
    if (!user) throw redirect({ to: "/login" });
    if (user.role !== "admin") throw redirect({ to: "/account" });

    const users = (await getAllUsersFn()) as AdminUserRow[];
    const requests = (await getEnrollmentRequestsFn()) as EnrollmentRequestRow[];
    return { users, requests };
  },
  component: AdminPage,
});

function AdminPage() {
  const { users: initialUsers, requests: initialRequests } = Route.useRouteContext();
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [requests, setRequests] = useState<EnrollmentRequestRow[]>(initialRequests);
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);
  const [loadingRequestId, setLoadingRequestId] = useState<number | null>(null);

  const students = users.filter((u) => u.role_name === "student");
  const teachers = users.filter((u) => u.role_name === "teacher");

  const reloadUsers = async () => {
    const rows = (await getAllUsersFn()) as AdminUserRow[];
    setUsers(rows);
  };
  const reloadRequests = async () => {
    const rows = (await getEnrollmentRequestsFn()) as EnrollmentRequestRow[];
    setRequests(rows);
  };

  const promoteToTeacher = async (userId: number) => {
    setLoadingUserId(userId);
    try {
      await promoteUserToTeacherFn({ data: { userId } });
      toast.success("Слушатель повышен до преподавателя");
      await reloadUsers();
    } catch (err: any) {
      toast.error(err?.message || "Не удалось повысить пользователя");
    } finally {
      setLoadingUserId(null);
    }
  };

  const deleteStudent = async (userId: number) => {
    setLoadingUserId(userId);
    try {
      await deleteStudentFn({ data: { userId } });
      toast.success("Слушатель удален");
      await reloadUsers();
    } catch (err: any) {
      toast.error(err?.message || "Не удалось удалить слушателя");
    } finally {
      setLoadingUserId(null);
    }
  };
  const processRequest = async (requestId: number, action: "approve" | "reject") => {
    setLoadingRequestId(requestId);
    try {
      await processEnrollmentRequestFn({ data: { requestId, action } });
      toast.success(action === "approve" ? "Заявка одобрена" : "Заявка отклонена");
      await reloadRequests();
    } catch (err: any) {
      toast.error(err?.message || "Не удалось обработать заявку");
    } finally {
      setLoadingRequestId(null);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-xl backdrop-blur sm:p-10">
          <h1 className="font-display text-3xl font-extrabold">Админ-панель</h1>
          <p className="mt-2 text-muted-foreground">
            Управление пользователями: просмотр слушателей и преподавателей, повышение роли и удаление слушателей.
          </p>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-display text-2xl font-bold">Заявки на обучение ({requests.filter((r) => r.request_status === "new").length} новых)</h2>
            <div className="mt-4 grid gap-3">
              {requests.length === 0 && (
                <div className="rounded-2xl bg-white p-4 text-sm text-muted-foreground">Заявок пока нет.</div>
              )}
              {requests.map((request) => {
                const preferredTeacherRaw = request.comment?.match(/preferred_teacher_id:(\d+)/)?.[1];
                const preferredTeacherId = preferredTeacherRaw ? Number(preferredTeacherRaw) : null;
                const preferredTeacher = preferredTeacherId ? teachers.find((teacher) => teacher.user_id === preferredTeacherId) : null;
                const visibleComment = request.comment
                  ?.split("\n")
                  .filter((line) => !line.startsWith("preferred_teacher_id:"))
                  .join("\n")
                  .trim();

                return (
                  <article key={request.request_id} className="rounded-2xl bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{request.applicant_name}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{request.applicant_email}</div>
                        <div className="mt-1 text-sm text-muted-foreground">Направление: {request.course_title}</div>
                        {preferredTeacher && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            Выбран преподаватель: {preferredTeacher.full_name}
                          </div>
                        )}
                        {visibleComment && <div className="mt-2 text-sm">{visibleComment}</div>}
                      </div>
                      <span className="rounded-xl bg-slate-100 px-2 py-1 text-xs font-semibold uppercase">{request.request_status}</span>
                    </div>
                    {request.request_status === "new" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => processRequest(request.request_id, "approve")}
                          disabled={loadingRequestId === request.request_id}
                          className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          Одобрить
                        </button>
                        <button
                          type="button"
                          onClick={() => processRequest(request.request_id, "reject")}
                          disabled={loadingRequestId === request.request_id}
                          className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          Отклонить
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-display text-2xl font-bold">Слушатели ({students.length})</h2>
              <div className="mt-4 grid gap-3">
                {students.length === 0 && (
                  <div className="rounded-2xl bg-white p-4 text-sm text-muted-foreground">Слушателей пока нет.</div>
                )}
                {students.map((student) => (
                  <article key={student.user_id} className="rounded-2xl bg-white p-4">
                    <div className="font-semibold">{student.full_name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{student.email}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => promoteToTeacher(student.user_id)}
                        disabled={loadingUserId === student.user_id}
                        className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                      >
                        Сделать преподавателем
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteStudent(student.user_id)}
                        disabled={loadingUserId === student.user_id}
                        className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        Удалить слушателя
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-display text-2xl font-bold">Преподаватели ({teachers.length})</h2>
              <div className="mt-4 grid gap-3">
                {teachers.length === 0 && (
                  <div className="rounded-2xl bg-white p-4 text-sm text-muted-foreground">Преподавателей пока нет.</div>
                )}
                {teachers.map((teacher) => (
                  <article key={teacher.user_id} className="rounded-2xl bg-white p-4">
                    <div className="font-semibold">{teacher.full_name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{teacher.email}</div>
                    {teacher.phone && <div className="mt-1 text-sm text-muted-foreground">{teacher.phone}</div>}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
