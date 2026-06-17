import { PageShell } from "@/components/PageShell";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Message = { role: "user" | "assistant"; content: string };
const CHAT_STORAGE_KEY = "interactive-ai-chat-history-v1";
const MAX_STORED_MESSAGES = 50;
const INITIAL_ASSISTANT_MESSAGE: Message = {
  role: "assistant",
  content: "Здравствуйте! Я ИИ-помощник платформы. Могу помочь с выбором направления и обучением.",
};

function isLikelyHtml(input: string): boolean {
  const trimmed = input.trim();
  return trimmed.startsWith("<") || /<html|<!doctype|<style|<head/i.test(trimmed);
}

function normalizeAssistantReply(input: string): string {
  if (!input || isLikelyHtml(input)) {
    return "Не удалось получить ответ. Проверьте OPENROUTER_API_KEY на сервере или попробуйте позже.";
  }
  return input;
}

function sanitizeMessages(raw: unknown): Message[] {
  if (!Array.isArray(raw)) return [INITIAL_ASSISTANT_MESSAGE];
  const cleaned = raw
    .filter((m): m is Message => {
      return (
        typeof m === "object" &&
        m !== null &&
        (m as Message).role !== undefined &&
        ((m as Message).role === "user" || (m as Message).role === "assistant") &&
        typeof (m as Message).content === "string"
      );
    })
    .map((m) => ({
      role: m.role,
      content:
        m.role === "assistant" ? normalizeAssistantReply(m.content) : m.content.slice(0, 4000),
    }))
    .slice(-MAX_STORED_MESSAGES);

  return cleaned.length > 0 ? cleaned : [INITIAL_ASSISTANT_MESSAGE];
}

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [{ title: "ИИ-помощник" }],
  }),
  component: AiPage,
});

function AiPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [INITIAL_ASSISTANT_MESSAGE];
    try {
      const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) return [INITIAL_ASSISTANT_MESSAGE];
      return sanitizeMessages(JSON.parse(raw));
    } catch {
      return [INITIAL_ASSISTANT_MESSAGE];
    }
  });
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
    } catch {
      // Ignore quota/storage errors and keep chat working in memory.
    }
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || pending) return;
    setPending(true);
    setInput("");
    const userMessage: Message = { role: "user", content: text };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    try {
      const { askAiAssistantFn } = await import("@/lib/ai-assistant");
      const result = await askAiAssistantFn({
        data: {
          message: text,
          history: newHistory.filter((m) => m.role !== "assistant" || m.content.length > 0),
        },
      });
      setMessages((prev) => [...prev, { role: "assistant", content: normalizeAssistantReply(result.answer) }]);
    } catch (err: any) {
      const message = typeof err?.message === "string" ? err.message : "Ошибка ИИ-помощника";
      const shortMessage = isLikelyHtml(message)
        ? "ИИ-помощник недоступен. Проверьте OPENROUTER_API_KEY на Render."
        : message.slice(0, 200);
      toast.error(shortMessage);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: normalizeAssistantReply(shortMessage) },
      ]);
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
          <button
            type="button"
            className="mt-3 text-xs text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => setMessages([INITIAL_ASSISTANT_MESSAGE])}
          >
            Очистить историю чата
          </button>

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
