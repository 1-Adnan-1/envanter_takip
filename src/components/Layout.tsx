import { useState, type ReactNode } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { useAuth } from "@/auth/AuthContext";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  Wrench,
  Users,
  History,
  LogOut,
  Package as PackageIcon,
  Menu,
  X,
  Sun,
  Moon,
  Shield,
  Wifi,
} from "lucide-react";

export type PageKey =
  | "dashboard"
  | "devices"
  | "addDevice"
  | "spareParts"
  | "profile"
  | "users"
  | "activity";

export function Layout({
  current,
  onNavigate,
  children,
}: {
  current: PageKey;
  onNavigate: (page: PageKey) => void;
  children: ReactNode;
}) {
  const { t, lang, setLang, theme, setTheme } = useI18n();
  const { session, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = session?.role === "admin";

  const navItems: {
    key: PageKey;
    label: string;
    icon: typeof LayoutDashboard;
    adminOnly?: boolean;
  }[] = [
    { key: "dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { key: "devices", label: t.nav.devices, icon: Package },
    {
      key: "addDevice",
      label: t.nav.addDevice,
      icon: PackagePlus,
      adminOnly: true,
    },
    { key: "spareParts", label: t.nav.spareParts, icon: Wrench },
    { key: "users", label: t.nav.users, icon: Users, adminOnly: true },
    { key: "activity", label: t.nav.activity, icon: History, adminOnly: true },
  ];

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const handleNav = (key: PageKey) => {
    onNavigate(key);
    setMobileOpen(false);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--color-surface)" }}
    >
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0 flex" : "-translate-x-full lg:translate-x-0 lg:flex"}`}
        style={{
          background: "var(--color-surface-2)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
              <PackageIcon className="h-5 w-5 text-[var(--color-accent)]" />
            </div>
            <span className="text-lg font-semibold text-slate-900">
              {t.appName}
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-500 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = current === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-[var(--color-accent)]/10 text-[var(--color-accent-2)] border border-[var(--color-accent)]/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-[var(--color-border)] p-3">
          <button
            onClick={() => handleNav("profile")}
            className="w-full rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-left transition hover:bg-[var(--color-surface-3)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-3)] text-sm font-semibold text-[var(--text-primary)] uppercase">
                  {session?.username.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {session?.username}
                  </p>
                  <p className="text-xs text-[var(--text-primary)]/70 truncate">
                    {t.profile.account}
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                {session?.role === "admin" ? t.roles.admin : t.roles.user}
              </span>
            </div>
          </button>
          <button
            onClick={logout}
            className="mt-3 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <LogOut className="h-5 w-5" />
            {t.nav.logout}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-[var(--color-surface-2)] border-b border-[var(--color-border)] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-[var(--text-primary)]"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              {current === "profile"
                ? t.profile.title
                : visibleItems.find((i) => i.key === current)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setLang("tr")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${lang === "tr" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
              >
                TR
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${lang === "en" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
              >
                EN
              </button>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setTheme("light")}
                title={t.theme.light}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${theme === "light" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                title={t.theme.dark}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${theme === "dark" ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
              <Wifi className="h-4 w-4" />
              <span>Company Network</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
