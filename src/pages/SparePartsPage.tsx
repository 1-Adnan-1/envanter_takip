import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { useAuth } from "@/auth/AuthContext";
import { useToast } from "@/components/ToastContext";
import { api } from "@/api/client";
import type { SparePart } from "@/types";
import {
  Card,
  Badge,
  Spinner,
  EmptyState,
  Button,
  Input,
  Modal,
  Select,
} from "@/components/ui";
import {
  Wrench,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingDown,
  DollarSign,
} from "lucide-react";

export function SparePartsPage() {
  const { t } = useI18n();
  const { session } = useAuth();
  const { show } = useToast();
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [adjustPart, setAdjustPart] = useState<SparePart | null>(null);
  const [editPart, setEditPart] = useState<SparePart | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);

  const isAdmin = session?.role === "admin";

  const load = () =>
    api.getSpareParts().then((p) => {
      setParts(p);
      setLoading(false);
    });
  useEffect(() => {
    load();
  }, []);

  const filtered = parts.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.supplier.toLowerCase().includes(q)
    );
  });

  const totalValue = parts.reduce((s, p) => s + p.stock * p.unitCost, 0);
  const totalParts = parts.reduce((s, p) => s + p.stock, 0);
  const lowStockCount = parts.filter(
    (p) => p.stock - p.faulty <= p.minStock,
  ).length;

  const handleAdjust = async (part: SparePart, newStock: number) => {
    await api.adjustStock(part.id, newStock, session?.username || "unknown");
    show(t.spareParts.saved);
    setAdjustPart(null);
    load();
  };

  const handleMarkFaulty = async (part: SparePart, delta: number) => {
    await api.markFaulty(part.id, delta, session?.username || "unknown");
    show(t.spareParts.saved);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.spareParts.confirmDelete)) return;
    await api.deleteSparePart(id, session?.username || "unknown");
    show(t.spareParts.deleted);
    load();
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="text-blue-500 text-3xl" />
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 ring-1 ring-slate-200">
              <Wrench className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{parts.length}</p>
              <p className="text-xs text-slate-500">
                {t.spareParts.totalParts}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 ring-1 ring-slate-200">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">
                {t.common.currency}
                {totalValue.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">
                {t.spareParts.totalValue}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 ring-1 ring-slate-200">
              <TrendingDown className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">
                {lowStockCount}
              </p>
              <p className="text-xs text-slate-500">
                {t.spareParts.lowStockAlert}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 ring-1 ring-slate-200">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">
                {parts.reduce((s, p) => s + p.faulty, 0)}
              </p>
              <p className="text-xs text-slate-500">{t.spareParts.faulty}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Faulty note */}
      <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5">
        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
        <p className="text-xs text-slate-600">{t.spareParts.faultyNote}</p>
      </div>

      {/* Search & Add */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.spareParts.search}
            className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditPart(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4" /> {t.spareParts.add}
          </Button>
        )}
      </div>

      {/* Parts table */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Wrench className="h-8 w-8" />}
            title={t.spareParts.noResults}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                    {t.spareParts.name}
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                    {t.spareParts.category}
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">
                    {t.spareParts.stock}
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">
                    {t.spareParts.faulty}
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">
                    {t.spareParts.available}
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">
                    {t.spareParts.location}
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">
                    {t.common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((part) => {
                  const available = part.stock - part.faulty;
                  const isLow = available <= part.minStock;
                  return (
                    <tr
                      key={part.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-900">
                          {part.name}
                        </p>
                        <p className="text-xs text-slate-500">{part.sku}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge variant="info">{part.category}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                        {part.stock}
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {part.faulty > 0 ? (
                          <Badge variant="error">{part.faulty}</Badge>
                        ) : (
                          <span className="text-slate-600">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isLow ? (
                          <Badge variant="warning">{available}</Badge>
                        ) : (
                          <Badge variant="success">{available}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-500">
                        {part.location}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-500">
                        {part.location}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setAdjustPart(part);
                                  setAdjustAmount(part.stock);
                                }}
                              >
                                {t.spareParts.adjust}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkFaulty(part, 1)}
                                title={t.spareParts.markFaulty}
                              >
                                <AlertTriangle className="h-4 w-4 text-slate-300" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkFaulty(part, -1)}
                                title={t.spareParts.markWorking}
                              >
                                <CheckCircle className="h-4 w-4 text-slate-300" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditPart(part);
                                  setShowForm(true);
                                }}
                              >
                                {t.common.edit}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(part.id)}
                              >
                                <XCircle className="h-4 w-4 text-slate-300" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Adjust stock modal */}
      <Modal
        open={!!adjustPart}
        onClose={() => setAdjustPart(null)}
        title={t.spareParts.adjustTitle}
        size="sm"
      >
        {adjustPart && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
              <p className="text-sm font-medium text-slate-900">
                {adjustPart.name}
              </p>
              <p className="text-xs text-slate-500">{adjustPart.sku}</p>
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span>
                  {t.spareParts.stock}: <strong>{adjustPart.stock}</strong>
                </span>
                <span>
                  {t.spareParts.faulty}: <strong>{adjustPart.faulty}</strong>
                </span>
                <span>
                  {t.spareParts.available}:{" "}
                  <strong>{adjustPart.stock - adjustPart.faulty}</strong>
                </span>
              </div>
            </div>
            <Input
              label={t.spareParts.newAmount}
              value={String(adjustAmount)}
              onChange={(v) => setAdjustAmount(parseInt(v) || 0)}
              type="number"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() =>
                  setAdjustAmount(Math.max(0, adjustPart.stock - 1))
                }
              >
                -1
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setAdjustAmount(adjustPart.stock + 1)}
              >
                +1
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setAdjustAmount(adjustPart.stock + 5)}
              >
                +5
              </Button>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setAdjustPart(null)}
              >
                {t.common.cancel}
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleAdjust(adjustPart, adjustAmount)}
              >
                {t.common.save}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit/Add form modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editPart ? t.spareParts.edit : t.spareParts.add}
        size="lg"
      >
        <SparePartForm
          part={editPart}
          onSave={async (part) => {
            await api.saveSparePart(part, session?.username || "unknown");
            show(t.spareParts.saved);
            setShowForm(false);
            load();
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}

function SparePartForm({
  part,
  onSave,
  onCancel,
}: {
  part: SparePart | null;
  onSave: (part: SparePart) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState<SparePart>(
    part || {
      id: "",
      name: "",
      sku: "",
      category: "",
      compatibleDevices: [],
      stock: 0,
      minStock: 0,
      faulty: 0,
      unitCost: 0,
      supplier: "",
      location: "",
    },
  );

  const set = <K extends keyof SparePart>(key: K, value: SparePart[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t.spareParts.name}
          value={form.name}
          onChange={(v) => set("name", v)}
          required
        />
        <Input
          label={t.spareParts.sku}
          value={form.sku}
          onChange={(v) => set("sku", v)}
          required
        />
        <Input
          label={t.spareParts.category}
          value={form.category}
          onChange={(v) => set("category", v)}
          placeholder="Storage, Memory..."
        />
        <Input
          label={t.spareParts.supplier}
          value={form.supplier}
          onChange={(v) => set("supplier", v)}
        />
        <Input
          label={t.spareParts.location}
          value={form.location}
          onChange={(v) => set("location", v)}
          placeholder="Warehouse A - Shelf 1"
        />
        <Input
          label={`${t.spareParts.unitCost} (${t.common.currency})`}
          value={String(form.unitCost)}
          onChange={(v) => set("unitCost", parseFloat(v) || 0)}
          type="number"
        />
        <Input
          label={t.spareParts.stock}
          value={String(form.stock)}
          onChange={(v) => set("stock", parseInt(v) || 0)}
          type="number"
        />
        <Input
          label={t.spareParts.minStock}
          value={String(form.minStock)}
          onChange={(v) => set("minStock", parseInt(v) || 0)}
          type="number"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <Button className="flex-1" onClick={() => onSave(form)}>
          {t.common.save}
        </Button>
      </div>
    </div>
  );
}
