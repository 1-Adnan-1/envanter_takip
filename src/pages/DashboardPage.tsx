import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { api } from "@/api/client";
import type { Device, SparePart, User } from "@/types";
import { Card, Badge, Spinner, EmptyState } from "@/components/ui";
import { getStatusVariant, getDeviceIcon } from "@/lib/helpers";
import {
  Package,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Users,
  ArrowRight,
  TrendingDown,
  Boxes,
} from "lucide-react";
import type { PageKey } from "@/components/Layout";

export function DashboardPage({
  onNavigate,
}: {
  onNavigate: (page: PageKey) => void;
}) {
  const { t } = useI18n();
  const [devices, setDevices] = useState<Device[]>([]);
  const [parts, setParts] = useState<SparePart[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDevices(), api.getSpareParts(), api.getUsers()]).then(
      ([d, p, u]) => {
        setDevices(d);
        setParts(p);
        setUsers(u);
        setLoading(false);
      },
    );
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="text-blue-500 text-3xl" />
      </div>
    );

  const activeCount = devices.filter((d) => d.status === "active").length;
  const faultyCount = devices.filter(
    (d) => d.status === "faulty" || d.status === "in_repair",
  ).length;
  const lowStockParts = parts.filter((p) => p.stock - p.faulty <= p.minStock);
  const totalStockValue = parts.reduce(
    (sum, p) => sum + p.stock * p.unitCost,
    0,
  );

  const stats = [
    {
      label: t.dashboard.totalDevices,
      value: devices.length,
      icon: Package,
      bg: "bg-[var(--color-accent)]/10",
      iconBg: "bg-[var(--color-accent)]/20",
      iconText: "text-[var(--color-accent)]",
      ring: "ring-[var(--color-accent)]/20",
    },
    {
      label: t.dashboard.activeDevices,
      value: activeCount,
      icon: CheckCircle,
      bg: "bg-[var(--color-success)]/10",
      iconBg: "bg-[var(--color-success)]/20",
      iconText: "text-[var(--color-success)]",
      ring: "ring-[var(--color-success)]/20",
    },
    {
      label: t.dashboard.faultyDevices,
      value: faultyCount,
      icon: AlertTriangle,
      bg: "bg-[var(--color-error)]/10",
      iconBg: "bg-[var(--color-error)]/20",
      iconText: "text-[var(--color-error)]",
      ring: "ring-[var(--color-error)]/20",
    },
    {
      label: t.dashboard.totalStock,
      value: parts.reduce((s, p) => s + p.stock, 0),
      icon: Boxes,
      bg: "bg-[var(--color-accent)]/10",
      iconBg: "bg-[var(--color-accent)]/20",
      iconText: "text-[var(--color-accent)]",
      ring: "ring-[var(--color-accent)]/20",
    },
    {
      label: t.dashboard.lowStock,
      value: lowStockParts.length,
      icon: TrendingDown,
      bg: "bg-[var(--color-warning)]/10",
      iconBg: "bg-[var(--color-warning)]/20",
      iconText: "text-[var(--color-warning)]",
      ring: "ring-[var(--color-warning)]/20",
    },
    {
      label: t.dashboard.totalUsers,
      value: users.filter((u) => u.active).length,
      icon: Users,
      bg: "bg-[var(--color-accent-2)]/10",
      iconBg: "bg-[var(--color-accent-2)]/20",
      iconText: "text-[var(--color-accent-2)]",
      ring: "ring-[var(--color-accent-2)]/20",
    },
  ];

  const typeCounts = devices.reduce(
    (acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const typeEntries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const maxTypeCount = Math.max(...Object.values(typeCounts), 1);

  const recentDevices = [...devices]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5 transition-all">
              <div
                className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg} ring-1 ${stat.ring}`}
              >
                <Icon className={`h-5 w-5 ${stat.iconText}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent devices */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              {t.dashboard.recentDevices}
            </h2>
            <button
              onClick={() => onNavigate("devices")}
              className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-2)] font-medium flex items-center gap-1 transition-colors"
            >
              {t.dashboard.viewAll} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {recentDevices.map((device) => {
              const Icon = getDeviceIcon(device.type);
              return (
                <button
                  key={device.id}
                  onClick={() => onNavigate("devices")}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 hover:border-[var(--color-accent)]/30 hover:shadow-sm transition-all text-left"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/15">
                    <Icon className="h-5 w-5 text-[var(--color-accent)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {device.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {device.inventoryNumber} · {device.assignedUser || "—"}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(device.status)}>
                    {t.status[device.status]}
                  </Badge>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Device type breakdown */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            {t.dashboard.deviceTypeBreakdown}
          </h2>
          <div className="space-y-3">
            {typeEntries.map(([type, count]) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-500">
                    {t.types[type as keyof typeof t.types]}
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {count}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)]"
                    style={{ width: `${(count / maxTypeCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Stock alerts */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          {t.dashboard.stockAlerts}
        </h2>
        {lowStockParts.length === 0 ? (
          <EmptyState
            icon={<CheckCircle className="h-8 w-8" />}
            title={t.spareParts.inStock}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockParts.map((part) => (
              <div
                key={part.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 shadow-sm"
              >
                <Wrench className="h-5 w-5 text-[var(--color-warning)] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {part.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {part.stock - part.faulty} / {part.minStock}{" "}
                    {t.spareParts.minStock}
                  </p>
                </div>
                <Badge variant="warning">{t.spareParts.lowStockAlert}</Badge>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {t.spareParts.totalValue}
          </span>
          <span className="text-lg font-bold text-slate-900">
            {t.common.currency} {totalStockValue.toLocaleString()}
          </span>
        </div>
      </Card>
    </div>
  );
}
