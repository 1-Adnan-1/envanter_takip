import { useEffect, useState, useMemo } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { api } from "@/api/client";
import type { Device } from "@/types";
import { Card, Badge, Spinner, EmptyState, Button } from "@/components/ui";
import { getStatusVariant, getDeviceIcon } from "@/lib/helpers";
import {
  Search,
  Package,
  ArrowRight,
  X,
  Cpu,
  Network,
  User,
  Monitor,
} from "lucide-react";

export function DevicesPage({
  onSelectDevice,
}: {
  onSelectDevice: (device: Device) => void;
}) {
  const { t } = useI18n();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    api.getDevices().then((d) => {
      setDevices(d);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return devices.filter((d) => {
      if (typeFilter !== "all" && d.type !== typeFilter) return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (!q) return true;
      return (
        d.inventoryNumber.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.ip.toLowerCase().includes(q) ||
        d.mac.toLowerCase().includes(q) ||
        d.assignedUser.toLowerCase().includes(q) ||
        d.username.toLowerCase().includes(q) ||
        d.serialNumber.toLowerCase().includes(q) ||
        d.manufacturer.toLowerCase().includes(q) ||
        d.model.toLowerCase().includes(q)
      );
    });
  }, [devices, search, typeFilter, statusFilter]);

  const hasFilters = search || typeFilter !== "all" || statusFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const typeOptions = [
    { value: "all", label: t.devices.all },
    ...Object.entries(t.types).map(([value, label]) => ({ value, label })),
  ];
  const statusOptions = [
    { value: "all", label: t.devices.all },
    ...Object.entries(t.status).map(([value, label]) => ({ value, label })),
  ];

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="text-blue-500 text-3xl" />
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.devices.searchPlaceholder}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] [&>option]:bg-[var(--color-surface-2)]"
            >
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] [&>option]:bg-[var(--color-surface-2)]"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {hasFilters && (
              <Button variant="secondary" onClick={clearFilters}>
                <X className="h-4 w-4" /> {t.devices.clear}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-slate-500">
          {t.devices.showing}{" "}
          <span className="font-semibold text-slate-900">
            {filtered.length}
          </span>{" "}
          {t.devices.of} {devices.length}
        </p>
      </div>

      {/* Device list */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Package className="h-8 w-8" />}
            title={t.devices.noResults}
            description={t.devices.noResultsDesc}
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  {t.devices.clear}
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((device) => (
            <button
              type="button"
              key={device.id}
              onClick={() => onSelectDevice(device)}
              className="w-full rounded-3xl border border-slate-200 bg-[var(--color-surface-2)] p-3 text-left transition hover:border-[var(--color-accent)]/30 hover:bg-white"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-xs font-semibold text-slate-700 uppercase">
                    {device.inventoryNumber.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {device.name}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {device.inventoryNumber} · {t.types[device.type]}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusVariant(device.status)}>
                  {t.status[device.status]}
                </Badge>
              </div>
              <div className="mt-3 grid gap-1.5 text-sm text-slate-500 sm:grid-cols-4">
                <div className="truncate">
                  <span className="font-semibold text-slate-900">
                    {t.devices.user}:{" "}
                  </span>
                  {device.assignedUser || "-"}
                </div>
                <div className="truncate">
                  <span className="font-semibold text-slate-900">
                    {t.devices.ip}:{" "}
                  </span>
                  {device.ip || "-"}
                </div>
                <div className="truncate">
                  <span className="font-semibold text-slate-900">
                    {t.devices.mac}:{" "}
                  </span>
                  {device.mac || "-"}
                </div>
                <div className="truncate">
                  <span className="font-semibold text-slate-900">
                    {t.devices.location}:{" "}
                  </span>
                  {device.location || "-"}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">{device.department || "-"}</span>
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  {t.devices.details}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
