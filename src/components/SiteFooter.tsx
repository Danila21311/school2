export function SiteFooter() {
  return (
    <footer className="px-3 sm:px-6 pb-6 pt-12 mt-16">
      <div className="glass mx-auto max-w-7xl p-6 sm:p-8 grid gap-6 md:grid-cols-3">
        <div>
          <div className="font-display font-bold text-lg">Образовательная организация</div>
          <p className="text-sm text-muted-foreground mt-2">
            Качественное образование, отвечающее современным стандартам.
          </p>
        </div>
        <div className="grid gap-1 text-sm">
          <div className="font-semibold mb-1">Контакты</div>
          <div className="text-muted-foreground">г. Оренбург, Шарлыкское шоссе, 1к2</div>
          <div className="text-muted-foreground">+7 (000) 000-00-00</div>
          <div className="text-muted-foreground">info@example.ru</div>
        </div>
        <div className="grid gap-1 text-sm">
          <div className="font-semibold mb-1">Режим работы</div>
          <div className="text-muted-foreground">Пн–Пт: 08:00 — 18:00</div>
          <div className="text-muted-foreground">Сб: 09:00 — 14:00</div>
          <div className="text-muted-foreground">Вс: выходной</div>
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground mt-4">
        © {new Date().getFullYear()} Образовательная организация. Все права защищены.
      </div>
    </footer>
  );
}
