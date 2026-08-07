import { useMemo } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { Card, Badge, Button } from "@/components/ui";
import { Shield, User, Mail, CheckCircle, Clock } from "lucide-react";

export function ProfilePage() {
  const { t } = useI18n();
  const { session, logout } = useAuth();

  const roleLabel = useMemo(
    () => (session?.role === "admin" ? t.roles.admin : t.roles.user),
    [session?.role, t.roles],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {t.profile.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t.profile.subtitle}</p>
        </div>
        <Button variant="secondary" onClick={logout}>
          {t.nav.logout}
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-4 rounded-3xl bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {t.profile.account}
                </p>
                <p className="text-xs text-slate-500">{session?.username}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {t.profile.username}
              </p>
              <p className="text-sm text-slate-900">{session?.username}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {t.profile.role}
              </p>
              <Badge variant={session?.role === "admin" ? "info" : "neutral"}>
                {roleLabel}
              </Badge>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-slate-700">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {t.profile.contact}
                </p>
                <p className="text-xs text-slate-500">
                  {t.profile.contactDesc}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-900">
                {session?.username}@company.local
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
              <span>{t.profile.secureNote}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {t.profile.activity}
            </p>
            <p className="text-xs text-slate-500">{t.profile.activityDesc}</p>
          </div>
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            <Clock className="h-4 w-4" />
            <span className="ml-2">{t.profile.recentActivity}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
