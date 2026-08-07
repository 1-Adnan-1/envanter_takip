import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { useAuth } from "@/auth/AuthContext";
import { api } from "@/api/client";
import type { Device } from "@/types";
import { Card, Badge, Spinner, Button } from "@/components/ui";
import { getStatusVariant, getDeviceIcon } from "@/lib/helpers";
import {
  ArrowLeft,
  Network,
  Cpu,
  Calendar,
  Printer,
  Camera,
  Video,
  AlertTriangle,
  Package,
} from "lucide-react";

export function DeviceDetailPage({
  device,
  onBack,
  onEdit,
}: {
  device: Device;
  onBack: () => void;
  onEdit: (device: Device) => void;
}) {
  const { t } = useI18n();
  const { session } = useAuth();
  const [fullDevice, setFullDevice] = useState<Device>(device);
  const [loading, setLoading] = useState(!device);
  const isAdmin = session?.role === "admin";

  useEffect(() => {
    if (device) {
      api.getDevice(device.id).then((d) => {
        if (d) setFullDevice(d);
        setLoading(false);
      });
    }
  }, [device]);

  if (loading || !fullDevice)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="text-blue-500 text-3xl" />
      </div>
    );

  const Icon = getDeviceIcon(fullDevice.type);
  const isFaulty =
    fullDevice.status === "faulty" || fullDevice.status === "in_repair";

  const infoRow = (label: string, value: string) => (
    <div className="flex flex-col py-2 border-b border-slate-200 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value || "—"}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> {t.devices.back}
        </Button>
        {isAdmin && (
          <Button onClick={() => onEdit(fullDevice)}>{t.devices.edit}</Button>
        )}
      </div>

      {isFaulty && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm font-medium text-slate-900">
            {t.devices.faultyWarning}
          </p>
        </div>
      )}

      {/* Title card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200">
            <Icon className="h-8 w-8 text-accent" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900">
                {fullDevice.name}
              </h2>
              <Badge variant={getStatusVariant(fullDevice.status)}>
                {t.status[fullDevice.status]}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              {fullDevice.inventoryNumber} · {t.types[fullDevice.type]} ·{" "}
              {fullDevice.manufacturer} {fullDevice.model}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">
              {t.devices.general}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            {infoRow(t.devices.inventoryNumber, fullDevice.inventoryNumber)}
            {infoRow(t.devices.name, fullDevice.name)}
            {infoRow(t.devices.type, t.types[fullDevice.type])}
            {infoRow(t.devices.manufacturer, fullDevice.manufacturer)}
            {infoRow(t.devices.model, fullDevice.model)}
            {infoRow(t.devices.serialNumber, fullDevice.serialNumber)}
            {infoRow(t.devices.assignedUser, fullDevice.assignedUser)}
            {infoRow(t.devices.username, fullDevice.username)}
            {infoRow(t.devices.department, fullDevice.department)}
            {infoRow(t.devices.location, fullDevice.location)}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Network className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">
              {t.devices.network}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            {infoRow(t.devices.ip, fullDevice.ip)}
            {infoRow(t.devices.mac, fullDevice.mac)}
            {infoRow(t.devices.os, fullDevice.os)}
            {infoRow("OS Version", fullDevice.osVersion)}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">
              {t.devices.hardware}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            {infoRow(t.devices.cpu, fullDevice.cpu)}
            {infoRow(
              t.devices.ram,
              fullDevice.ramGB ? `${fullDevice.ramGB} GB` : "",
            )}
            {infoRow(
              t.devices.storage,
              fullDevice.storageGB ? `${fullDevice.storageGB} GB` : "",
            )}
            {infoRow(t.devices.storageType, fullDevice.storageType)}
            {infoRow(t.devices.gpu, fullDevice.gpu)}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">
              {t.devices.purchase}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            {infoRow(t.devices.purchaseDate, fullDevice.purchaseDate)}
            {infoRow(t.devices.warrantyExpiry, fullDevice.warrantyExpiry)}
            {infoRow(t.devices.vendor, fullDevice.vendor)}
            {infoRow(t.devices.notes, fullDevice.notes)}
            {infoRow(t.devices.lastSeen, fullDevice.lastSeen)}
            {infoRow(t.devices.addedOn, fullDevice.createdAt.split("T")[0])}
          </div>
        </Card>
      </div>

      {/* Printers */}
      {fullDevice.printers.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Printer className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">
              {t.devices.printers} ({fullDevice.printers.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {fullDevice.printers.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-900">{p.name}</p>
                  <Badge
                    variant={p.status === "online" ? "success" : "neutral"}
                  >
                    {p.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{p.model}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {p.ip} · {p.mac}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Cameras */}
      {(fullDevice.cameras.length > 0 || fullDevice.cameraSystem) && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {fullDevice.cameraSystem ? (
              <Video className="h-5 w-5 text-slate-500" />
            ) : (
              <Camera className="h-5 w-5 text-slate-500" />
            )}
            <h3 className="text-sm font-semibold text-slate-900">
              {fullDevice.cameraSystem
                ? t.devices.cameraSystem
                : `${t.devices.cameras} (${fullDevice.cameras.length})`}
            </h3>
          </div>
          {fullDevice.cameraSystem && (
            <p className="text-sm text-slate-400 mb-3">
              {fullDevice.cameraSystem}
            </p>
          )}
          {fullDevice.cameras.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {fullDevice.cameras.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-900">
                      {c.name}
                    </p>
                    <Badge
                      variant={c.status === "online" ? "success" : "neutral"}
                    >
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{c.model}</p>
                  <p className="text-xs text-slate-500 mt-1">{c.location}</p>
                  <p className="text-xs text-slate-500">
                    {c.ip} · {c.mac}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
