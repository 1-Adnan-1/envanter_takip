import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useAuth } from '@/auth/AuthContext';
import { useToast } from '@/components/ToastContext';
import { api } from '@/api/client';
import type { Device, DeviceType, DeviceStatus, OSName } from '@/types';
import { Card, Button, Input, Select, Textarea } from '@/components/ui';
import { Save, X, Package, Network, Cpu, Calendar, Printer, Camera, Plus, Trash2 } from 'lucide-react';
import type { PageKey } from '@/components/Layout';

const emptyDevice: Device = {
  id: '', inventoryNumber: '', name: '', type: 'computer', status: 'active',
  manufacturer: '', model: '', serialNumber: '', assignedUser: '', username: '',
  department: '', location: '', ip: '', mac: '', os: 'None', osVersion: '',
  cpu: '', ramGB: 0, storageGB: 0, storageType: 'N/A', gpu: '',
  purchaseDate: '', warrantyExpiry: '', vendor: '', notes: '',
  printers: [], cameras: [], cameraSystem: '', lastSeen: '', createdAt: '', updatedAt: '',
};

export function DeviceFormPage({ existing, onDone, onCancel }: {
  existing: Device | null;
  onDone: (page: PageKey) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const { session } = useAuth();
  const { show } = useToast();
  const [device, setDevice] = useState<Device>(existing ? { ...existing } : { ...emptyDevice });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Device>(key: K, value: Device[K]) => setDevice(d => ({ ...d, [key]: value }));

  const typeOptions = Object.entries(t.types).map(([value, label]) => ({ value, label }));
  const statusOptions = Object.entries(t.status).map(([value, label]) => ({ value, label }));
  const osOptions: { value: OSName; label: string }[] = (['Windows 11 Pro', 'Windows 10 Pro', 'Windows Server 2022', 'Windows Server 2019', 'Ubuntu 22.04 LTS', 'macOS Sonoma', 'macOS Ventura', 'Debian 12', 'Proprietary', 'None'] as OSName[]).map(o => ({ value: o, label: o }));
  const storageOptions = [{ value: 'N/A', label: 'N/A' }, { value: 'SSD', label: 'SSD' }, { value: 'HDD', label: 'HDD' }, { value: 'NVMe', label: 'NVMe' }];

  const handleSave = async () => {
    if (!device.inventoryNumber || !device.name) {
      show(t.devices.required, 'error');
      return;
    }
    setSaving(true);
    try {
      await api.saveDevice(device, session?.username || 'unknown');
      show(t.devices.saved);
      onDone('devices');
    } catch {
      show('Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addPrinter = () => set('printers', [...device.printers, { id: `prn-${Date.now()}`, name: '', model: '', ip: '', mac: '', status: 'offline' }]);
  const removePrinter = (id: string) => set('printers', device.printers.filter(p => p.id !== id));
  const updatePrinter = (id: string, key: string, value: string) => set('printers', device.printers.map(p => p.id === id ? { ...p, [key]: value } : p));

  const addCamera = () => set('cameras', [...device.cameras, { id: `cam-${Date.now()}`, name: '', model: '', ip: '', mac: '', location: '', status: 'offline' }]);
  const removeCamera = (id: string) => set('cameras', device.cameras.filter(c => c.id !== id));
  const updateCamera = (id: string, key: string, value: string) => set('cameras', device.cameras.map(c => c.id === id ? { ...c, [key]: value } : c));

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">{existing ? t.devices.editDevice : t.devices.newDevice}</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel}><X className="h-4 w-4" /> {t.devices.cancel}</Button>
          <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4" /> {t.devices.save}</Button>
        </div>
      </div>

      {/* Basic info */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900">{t.devices.basicInfo}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={t.devices.inventoryNumber} value={device.inventoryNumber} onChange={v => set('inventoryNumber', v)} required placeholder="INV-00041" />
          <Input label={t.devices.name} value={device.name} onChange={v => set('name', v)} required placeholder="Device name" />
          <Select label={t.devices.type} value={device.type} onChange={v => set('type', v as DeviceType)} options={typeOptions} required />
          <Select label={t.devices.status} value={device.status} onChange={v => set('status', v as DeviceStatus)} options={statusOptions} required />
          <Input label={t.devices.manufacturer} value={device.manufacturer} onChange={v => set('manufacturer', v)} placeholder="Dell, HP, etc." />
          <Input label={t.devices.model} value={device.model} onChange={v => set('model', v)} placeholder="Model" />
          <Input label={t.devices.serialNumber} value={device.serialNumber} onChange={v => set('serialNumber', v)} placeholder="Serial number" />
          <Input label={t.devices.assignedUser} value={device.assignedUser} onChange={v => set('assignedUser', v)} placeholder="Full name" />
          <Input label={t.devices.username} value={device.username} onChange={v => set('username', v)} placeholder="user.name" />
          <Input label={t.devices.department} value={device.department} onChange={v => set('department', v)} placeholder="IT, HR, etc." />
          <Input label={t.devices.location} value={device.location} onChange={v => set('location', v)} placeholder="Location" />
        </div>
      </Card>

      {/* Network info */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Network className="h-5 w-5 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900">{t.devices.networkInfo}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={t.devices.ip} value={device.ip} onChange={v => set('ip', v)} placeholder="10.0.1.50" />
          <Input label={t.devices.mac} value={device.mac} onChange={v => set('mac', v)} placeholder="00:1A:2B:3C:4D:5E" />
          <Select label={t.devices.os} value={device.os} onChange={v => set('os', v as OSName)} options={osOptions} />
          <Input label="OS Version" value={device.osVersion} onChange={v => set('osVersion', v)} placeholder="Version 23.2" />
        </div>
      </Card>

      {/* Hardware info */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="h-5 w-5 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900">{t.devices.hardwareInfo}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={t.devices.cpu} value={device.cpu} onChange={v => set('cpu', v)} placeholder="Intel Core i7" />
          <Input label={`${t.devices.ram} (GB)`} value={String(device.ramGB || '')} onChange={v => set('ramGB', parseInt(v) || 0)} type="number" placeholder="16" />
          <Input label={`${t.devices.storage} (GB)`} value={String(device.storageGB || '')} onChange={v => set('storageGB', parseInt(v) || 0)} type="number" placeholder="512" />
          <Select label={t.devices.storageType} value={device.storageType} onChange={v => set('storageType', v as Device['storageType'])} options={storageOptions} />
          <Input label={t.devices.gpu} value={device.gpu} onChange={v => set('gpu', v)} placeholder="GPU model" />
        </div>
      </Card>

      {/* Purchase info */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900">{t.devices.purchaseInfo}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label={t.devices.purchaseDate} value={device.purchaseDate} onChange={v => set('purchaseDate', v)} type="date" />
          <Input label={t.devices.warrantyExpiry} value={device.warrantyExpiry} onChange={v => set('warrantyExpiry', v)} type="date" />
          <Input label={t.devices.vendor} value={device.vendor} onChange={v => set('vendor', v)} placeholder="Vendor" />
          <Input label={t.devices.cameraSystem} value={device.cameraSystem} onChange={v => set('cameraSystem', v)} placeholder="NVR/DVR system" />
        </div>
        <div className="mt-4">
          <Textarea label={t.devices.notes} value={device.notes} onChange={v => set('notes', v)} placeholder="Notes..." />
        </div>
      </Card>

      {/* Printers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">{t.devices.printers}</h3>
          </div>
          <Button variant="secondary" size="sm" onClick={addPrinter}><Plus className="h-4 w-4" /> {t.devices.add}</Button>
        </div>
        {device.printers.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">{t.devices.noPrinters}</p>
        ) : (
          <div className="space-y-3">
            {device.printers.map(p => (
              <div key={p.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end p-3 rounded-lg bg-slate-50">
                <Input label="Name" value={p.name} onChange={v => updatePrinter(p.id, 'name', v)} placeholder="Printer name" />
                <Input label="Model" value={p.model} onChange={v => updatePrinter(p.id, 'model', v)} placeholder="Model" />
                <Input label="IP" value={p.ip} onChange={v => updatePrinter(p.id, 'ip', v)} placeholder="IP" />
                <Input label="MAC" value={p.mac} onChange={v => updatePrinter(p.id, 'mac', v)} placeholder="MAC" />
                <div className="flex gap-2">
                  <select value={p.status} onChange={e => updatePrinter(p.id, 'status', e.target.value)} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white">
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                  <Button variant="danger" size="sm" onClick={() => removePrinter(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Cameras */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">{t.devices.cameras}</h3>
          </div>
          <Button variant="secondary" size="sm" onClick={addCamera}><Plus className="h-4 w-4" /> {t.devices.add}</Button>
        </div>
        {device.cameras.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">{t.devices.noCameras}</p>
        ) : (
          <div className="space-y-3">
            {device.cameras.map(c => (
              <div key={c.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end p-3 rounded-lg bg-slate-50">
                <Input label="Name" value={c.name} onChange={v => updateCamera(c.id, 'name', v)} placeholder="Camera name" />
                <Input label="Model" value={c.model} onChange={v => updateCamera(c.id, 'model', v)} placeholder="Model" />
                <Input label="IP" value={c.ip} onChange={v => updateCamera(c.id, 'ip', v)} placeholder="IP" />
                <Input label="MAC" value={c.mac} onChange={v => updateCamera(c.id, 'mac', v)} placeholder="MAC" />
                <Input label="Location" value={c.location} onChange={v => updateCamera(c.id, 'location', v)} placeholder="Location" />
                <div className="flex gap-2">
                  <select value={c.status} onChange={e => updateCamera(c.id, 'status', e.target.value)} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white">
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                  <Button variant="danger" size="sm" onClick={() => removeCamera(c.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Footer actions */}
      <div className="flex justify-end gap-2 pb-4">
        <Button variant="secondary" onClick={onCancel}><X className="h-4 w-4" /> {t.devices.cancel}</Button>
        <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4" /> {t.devices.save}</Button>
      </div>
    </div>
  );
}
