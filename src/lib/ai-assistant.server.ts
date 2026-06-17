import { existsSync, readFileSync } from "fs";
import { join } from "path";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SITE_CONTEXT = `
Ты помогаешь только по сайту ООО «Интерактив» (платформа дистанционного обучения).

Ключевая структура сайта:
- Главная (/): описание платформы, преимущества, популярные курсы, FAQ, кнопка подачи заявки.
- Направления (/programs): 5 направлений:
  1) Бухгалтерский учет
  2) Анализ и аудит
  3) Охрана труда
  4) Повышение квалификации
  5) Профессиональная подготовка
- ИИ-помощник (/ai): чат с подсказками по сайту и обучению.
- Контакты (/map): контакты и форма обратной связи.
- Документы (/documents): перечень официальных документов.
- Сведения об организации (/sveden): информация об образовательной организации.
- Авторизация и регистрация (/login, /register).
- Личный кабинет (/account), кабинет преподавателя (/teacher), админ-панель (/admin).
- Учебные разделы: теория (/theory), тест (/test), итоговый тест (/final-test).

Роли пользователей:
- student (слушатель): просмотр своих курсов и учебных материалов.
- teacher (преподаватель): управление доступом слушателей к материалам.
- admin (администратор): управление пользователями и заявками.

Принципы ответа:
1) Отвечай строго по этому сайту и его страницам.
2) Если вопрос не относится к структуре/контенту сайта, мягко скажи об этом и предложи, куда перейти на сайте.
3) Не выдумывай несуществующие разделы и функции.
`;

function toPlainText(input: string): string {
  return input
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

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

function isLikelyHtml(input: string): boolean {
  const trimmed = input.trim();
  return (
    trimmed.startsWith("<") ||
    /<html|<!doctype|<style|<head/i.test(trimmed)
  );
}

function shortenErrorDetails(status: number, details: string): string {
  if (isLikelyHtml(details)) {
    if (status === 401 || status === 403) return "неверный API-ключ";
    if (status === 502 || status === 503) return "сервис временно недоступен";
    return "некорректный ответ сервиса";
  }
  return details.replace(/\s+/g, " ").slice(0, 180);
}

function getOpenRouterReferer(): string {
  return (
    process.env.RENDER_EXTERNAL_URL ||
    process.env.SITE_URL ||
    "https://liquid-school-portal.onrender.com"
  );
}

export async function callOpenRouter(data: { message: string; history?: ChatMessage[] }) {
  const apiKey = process.env.OPENROUTER_API_KEY || readOpenRouterKeyFromDevVars();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY не настроен на сервере");
  }

  const cleanedHistory = (data.history || []).slice(-8).map((m) => ({
    role: m.role,
    content: m.content.slice(0, 2000),
  }));

  const requestBody = JSON.stringify({
    model: "deepseek/deepseek-chat-v3-0324",
    messages: [
      {
        role: "system",
        content:
          `Ты ИИ-помощник образовательной платформы. Отвечай кратко и по делу на русском языке.
${SITE_CONTEXT}
Формат ответа:
- Только обычный текст.
- Без markdown-форматирования.
- Не используй звездочки, например * и **.
- Не используй списки с маркерами.`,
      },
      ...cleanedHistory,
      { role: "user", content: data.message },
    ],
    temperature: 0.4,
  });

  const makeRequest = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      return await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": getOpenRouterReferer(),
          "X-Title": "Liquid School Portal",
        },
        body: requestBody,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  };

  let response: Response;
  try {
    response = await makeRequest();
  } catch {
    // One quick retry helps with transient network hiccups.
    try {
      response = await makeRequest();
    } catch {
      throw new Error("OpenRouter недоступен: ошибка сети или таймаут. Проверьте интернет/VPN и повторите запрос.");
    }
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Ошибка OpenRouter (${response.status}): ${shortenErrorDetails(response.status, details)}`,
    );
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("OpenRouter вернул некорректный ответ");
  }

  let payload: { choices?: Array<{ message?: { content?: string } }> };
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    throw new Error("OpenRouter вернул некорректный JSON");
  }

  const rawAnswer = payload.choices?.[0]?.message?.content?.trim() || "";
  if (isLikelyHtml(rawAnswer)) {
    throw new Error("OpenRouter вернул некорректный ответ");
  }

  const answer = toPlainText(rawAnswer);
  if (!answer) throw new Error("OpenRouter вернул пустой ответ");

  return { answer };
}
