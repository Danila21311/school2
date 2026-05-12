import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="glass-strong p-10 max-w-md text-center grid gap-3">
        <h1 className="text-7xl font-display font-extrabold text-primary">404</h1>
        <h2 className="text-xl font-semibold">Страница не найдена</h2>
        <p className="text-sm text-muted-foreground">Возможно, страница была перемещена или удалена.</p>
        <Link to="/" className="glass glass-hover px-4 py-2 rounded-xl font-semibold inline-block mt-2">
          На главную
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Образовательная организация" },
      { name: "description", content: "Современная образовательная организация" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://cdn-uicons.flaticon.com/uicons-regular-rounded/css/uicons-regular-rounded.css",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster position="top-right" />
    </>
  );
}
