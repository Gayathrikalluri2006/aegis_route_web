import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { LANGS, useI18n, type LangCode } from "@/lib/i18n";

function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as LangCode)}
      aria-label="Language"
      className="rounded-md border border-border bg-background/60 px-2 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground outline-none hover:border-primary/50 focus:border-primary"
    >
      {LANGS.map((l) => (
        <option key={l.code} value={l.code}>
          {l.flag} {l.code.toUpperCase()}
        </option>
      ))}
    </select>
  );
}

export function SiteHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-destructive shadow-[var(--shadow-glow)]">
            <Shield className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold tracking-tight">{t("app_name")}</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{t("tagline")}</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {[
            { to: "/navigate", label: t("nav_navigate") },
            { to: "/incidents", label: t("nav_incidents") },
            { to: "/dashboard", label: t("nav_dashboard") },
            { to: "/about", label: t("nav_about") },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-1.5 text-sm text-foreground bg-accent" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            to="/auth"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03]"
          >
            {t("sign_in")}
          </Link>
        </div>
      </div>
    </header>
  );
}
