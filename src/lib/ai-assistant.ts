import { createServerFn } from "@tanstack/react-start";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

type ChatMessage = { role: "user" | "assistant"; content: string };

function readOpenRouterKeyFromDevVars(): string | null {
  try {
    const filePath = join(process.cwd(), ".dev.vars");
    if (!existsSync(filePath)) return null;
    const raw = readFileSync(filePath, "utf-8");
    const line = raw
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.startsWith("OPENROUTER_API_KEY="));
    if (!line) return null;
    const value = line.slice("OPENROUTER_API_KEY=".length).trim();
    return value || null;
  } catch {
    return null;
  }
}

export const askAiAssistantFn = createServerFn({ method: "POST" })
  .inputValidator((data: { message: string; history?: ChatMessage[] }) => data)
  .handler(async (ctx) => {
    const apiKey = process.env.OPENROUTER_API_KEY || readOpenRouterKeyFromDevVars();
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY не настроен на сервере");
    }

    const cleanedHistory = (ctx.data.history || []).slice(-8).map((m) => ({
      role: m.role,
      content: m.content.slice(0, 2000),
    }));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8080",
        "X-Title": "Liquid School Portal",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324",
        messages: [
          {
            role: "system",
            content:
              "Ты ИИ-помощник образовательной платформы. Отвечай кратко, по делу, на русском языке.",
          },
          ...cleanedHistory,
          { role: "user", content: ctx.data.message },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Ошибка OpenRouter: ${response.status} ${details}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const answer = payload.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("OpenRouter вернул пустой ответ");

    return { answer };
  });
