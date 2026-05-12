import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { createEnrollmentRequestFn, getCurrentUserFn, getTeachersFn } from "@/lib/portal-db";

const schema = z.object({
  phone: z.string().trim().min(5, "Укажите телефон").max(30).regex(/^[+\d\s()-]+$/, "Только цифры и знаки +-()"),
  comment: z.string().trim().max(500).optional().or(z.literal("")),
  preferredTeacherId: z.string().optional(),
});

export function EnrollDialog({
  open,
  program,
  onClose,
}: {
  open: boolean;
  program: string | null;
  onClose: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [currentUser, setCurrentUser] = useState<null | { role: "student" | "teacher" | "admin"; phone?: string | null }>(null);
  const [teachers, setTeachers] = useState<Array<{ user_id: number; full_name: string }>>([]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    const load = async () => {
      try {
        const user = await getCurrentUserFn();
        if (!mounted) return;
        setCurrentUser(user ? { role: user.role, phone: user.phone } : null);
        if (user?.role === "student") {
          try {
            const rows = (await getTeachersFn()) as Array<{ user_id: number; full_name: string }>;
            if (mounted) setTeachers(rows);
          } catch (err) {
            console.error(err);
            if (mounted) {
              setTeachers([]);
              toast.error("Не удалось загрузить список преподавателей. Попробуйте позже.");
            }
          }
        } else {
          setTeachers([]);
        }
      } catch {
        if (mounted) {
          setCurrentUser(null);
          setTeachers([]);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [open]);

  if (!open || !program) return null;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Для отправки заявки нужно войти в аккаунт");
      return;
    }
    if (currentUser.role !== "student") {
      toast.error("Заявку на обучение может отправить только слушатель");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      phone: fd.get("phone"),
      comment: fd.get("comment"),
      preferredTeacherId: fd.get("preferredTeacherId"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Проверьте поля");
      return;
    }
    setPending(true);
    try {
      await createEnrollmentRequestFn({
        data: {
          programTitle: program,
          phone: parsed.data.phone,
          comment: parsed.data.comment || "",
          preferredTeacherId: parsed.data.preferredTeacherId ? Number(parsed.data.preferredTeacherId) : null,
        },
      });
      toast.success("Заявка отправлена. Мы свяжемся с вами.");
      onClose();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-strong relative w-full max-w-lg p-6 sm:p-8 grid gap-5">
        <div className="grid gap-1">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Запись на программу</div>
          <h2 className="font-display font-bold text-2xl">{program}</h2>
          <p className="text-sm text-muted-foreground">Выберите преподавателя и отправьте заявку на одобрение администратору.</p>
        </div>
        {!currentUser ? (
          <div className="rounded-xl bg-amber-50 p-4 text-sm">
            Для подачи заявки нужно войти как слушатель.{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Войти
            </Link>
          </div>
        ) : null}
        <form onSubmit={submit} className="grid gap-3">
          <Field name="phone" label="Телефон" placeholder="+7 (___) ___-__-__" defaultValue={currentUser?.phone || ""} />
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-foreground/70">Выберите преподавателя</span>
            <select name="preferredTeacherId" className="glass rounded-xl px-4 py-3 text-sm w-full bg-white/40">
              <option value="">Без предпочтений</option>
              {teachers.map((teacher) => (
                <option key={teacher.user_id} value={teacher.user_id}>
                  {teacher.full_name}
                </option>
              ))}
            </select>
            {currentUser?.role === "student" && teachers.length === 0 ? (
              <p className="text-xs text-amber-900/80">
                В каталоге пока нет преподавателей. Можно отправить заявку без предпочтений или попросить администратора
                завести аккаунты преподавателей.
              </p>
            ) : null}
          </label>
          <Field name="comment" label="Комментарий" textarea placeholder="Дополнительная информация" />
          <div className="grid grid-cols-2 gap-3 mt-2">
            <button type="button" onClick={onClose} className="glass glass-hover px-4 py-3 rounded-xl font-semibold">Отмена</button>
            <button
              type="submit"
              disabled={pending || !currentUser || currentUser.role !== "student"}
              className="glass-strong glass-hover px-4 py-3 rounded-xl font-semibold text-primary disabled:opacity-50"
            >
              {pending ? "Отправка..." : "Отправить заявку"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  name, label, type = "text", placeholder, textarea,
  defaultValue,
}: { name: string; label: string; type?: string; placeholder?: string; textarea?: boolean; defaultValue?: string }) {
  const cls = "glass rounded-xl px-4 py-3 text-sm w-full bg-white/40 focus:bg-white/70 outline-none focus:ring-2 focus:ring-primary/40 transition";
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold text-foreground/70">{label}</span>
      {textarea ? (
        <textarea name={name} placeholder={placeholder} rows={3} className={cls} maxLength={500} />
      ) : (
        <input name={name} type={type} placeholder={placeholder} className={cls} maxLength={255} defaultValue={defaultValue} />
      )}
    </label>
  );
}
