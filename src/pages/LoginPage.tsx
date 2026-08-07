import { useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { useAuth } from "@/auth/AuthContext";
import { api } from "@/api/client";
import { Button, Input, Spinner } from "@/components/ui";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Globe,
  Package,
  Wifi,
} from "lucide-react";

type NetState = "idle" | "checking" | "ok" | "fail";

export function LoginPage() {
  const { t, lang, setLang } = useI18n();
  const { login, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [netState, setNetState] = useState<NetState>("idle");
  const [netInfo, setNetInfo] = useState<{
    ssid?: string;
    connectionType?: string;
  }>({});

  const checkNetwork = async () => {
    setNetState("checking");
    const result = await api.checkNetworkAccess();
    if (result.allowed) {
      setNetState("ok");
      setNetInfo({ ssid: result.ssid, connectionType: result.connectionType });
    } else {
      setNetState("fail");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (netState !== "ok") {
      await checkNetwork();
      return;
    }
    try {
      await login(username, password);
    } catch {
      setError(t.login.error);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent)]/15 shadow-lg shadow-slate-300/20">
              <Package className="h-8 w-8 text-[var(--color-accent)]" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">{t.appName}</h1>
          <p className="mt-1 text-sm text-slate-600">{t.appTagline}</p>
        </div>

        {/* Login card */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-lg p-8 relative z-10">
          {/* Network security banner */}
          <div
            className={`mb-6 rounded-xl p-4 border transition-all ${
              netState === "ok"
                ? "bg-emerald-50 border-emerald-200"
                : netState === "fail"
                  ? "bg-red-50 border-red-200"
                  : netState === "checking"
                    ? "bg-slate-50 border-slate-200"
                    : "bg-slate-50 border-slate-200"
            }`}
          >
            {netState === "idle" && (
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {t.login.networkCheck}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {t.login.networkDesc}
                  </p>
                  <button
                    onClick={checkNetwork}
                    className="mt-2 text-xs font-medium text-[var(--color-accent)] underline hover:text-[var(--color-accent-2)]"
                  >
                    {t.login.networkCheck}
                  </button>
                </div>
              </div>
            )}
            {netState === "checking" && (
              <div className="flex items-center gap-3">
                <Spinner className="text-[var(--color-accent)] text-xl" />
                <p className="text-sm font-medium text-slate-900">
                  {t.login.networkCheck}
                </p>
              </div>
            )}
            {netState === "ok" && (
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {t.login.networkOk}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1">
                    <Wifi className="h-3 w-3 text-slate-400" /> {netInfo.ssid} ·{" "}
                    {netInfo.connectionType}
                  </p>
                </div>
              </div>
            )}
            {netState === "fail" && (
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {t.login.networkFail}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {t.login.networkDesc}
                  </p>
                  <button
                    onClick={checkNetwork}
                    className="mt-2 text-xs font-medium text-[var(--color-accent)] underline hover:text-[var(--color-accent-2)]"
                  >
                    {t.login.networkCheck}
                  </button>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              {t.login.title}
            </h2>
            <p className="text-sm text-slate-600 -mt-2">{t.login.subtitle}</p>

            <Input
              label={t.login.username}
              value={username}
              onChange={setUsername}
              placeholder="admin / a.yilmaz"
              required
            />
            <Input
              label={t.login.password}
              value={password}
              onChange={setPassword}
              type="password"
              placeholder="••••••••"
              required
            />

            {error && (
              <p className="text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Spinner className="text-white text-lg" /> {t.login.signingIn}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> {t.login.signIn}
                </>
              )}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t.login.demoAccounts}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setUsername("admin");
                  setPassword("admin123");
                }}
                className="w-full flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-left hover:bg-slate-100 transition-colors"
              >
                <div>
                  <span className="text-sm font-medium text-slate-900">
                    {t.login.admin}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">
                    admin / admin123
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {t.roles.admin}
                </span>
              </button>
              <button
                onClick={() => {
                  setUsername("a.yilmaz");
                  setPassword("user123");
                }}
                className="w-full flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-left hover:bg-slate-100 transition-colors"
              >
                <div>
                  <span className="text-sm font-medium text-slate-900">
                    {t.login.user}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">
                    a.yilmaz / user123
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {t.roles.user}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Language toggle */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <Globe className="h-4 w-4 text-slate-500" />
          <button
            onClick={() => setLang("tr")}
            className={`text-sm font-medium transition-colors ${lang === "tr" ? "text-[var(--color-accent)]" : "text-slate-500 hover:text-slate-700"}`}
          >
            Türkçe
          </button>
          <span className="text-slate-400">·</span>
        </div>
        <p className="mt-6 text-center text-xs text-slate-600">
          {t.appName} · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
