import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { askAiAssistantFn } from "@/lib/ai-assistant";

type Message = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [{ title: "ИИ-помощник" }],
  }),
  component: AiPage,
});

function AiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Здравствуйте! Я ИИ-помощник платформы. Могу помочь с выбором направления и обучением.",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || pending) return;
    setPending(true);
    setInput("");
    const userMessage: Message = { role: "user", content: text };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    try {
      const result = await askAiAssistantFn({
        data: {
          message: text,
          history: newHistory.filter((m) => m.role !== "assistant" || m.content.length > 0),
        },
      });
      setMessages((prev) => [...prev, { role: "assistant", content: result.answer }]);
    } catch (err: any) {
      toast.error(err?.message || "Ошибка ИИ-помощника");
      setMessages((prev) => [...prev, { role: "assistant", content: "Не удалось получить ответ. Попробуйте еще раз." }]);
    } finally {
      setPending(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur sm:p-8">
          <h1 className="font-display text-3xl font-extrabold">ИИ-помощник</h1>
          <p className="mt-2 text-sm text-muted-foreground">Чат работает через OpenRouter (DeepSeek Chat v3).</p>

          <div className="mt-6 grid max-h-[55vh] gap-3 overflow-auto rounded-2xl bg-slate-50 p-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user" ? "ml-auto bg-slate-950 text-white" : "bg-white text-foreground"
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void send();
              }}
              placeholder="Напишите вопрос..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={pending}
              className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "..." : "Отправить"}
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
