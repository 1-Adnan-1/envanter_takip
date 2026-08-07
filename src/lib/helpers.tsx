import type { DeviceStatus, DeviceType } from '@/types';
import { Monitor, Laptop, Server, Printer, Camera, Video, Router, Network, Phone, ScanLine, Tablet, Wifi, HardDrive, HelpCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function getStatusVariant(status: DeviceStatus): 'success' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'active': return 'success';
    case 'faulty': return 'error';
    case 'in_repair': return 'warning';
    case 'retired': return 'neutral';
  }
}

export function getDeviceIcon(type: DeviceType): LucideIcon {
  const map: Record<DeviceType, LucideIcon> = {
    computer: Monitor,
    laptop: Laptop,
    server: Server,
    printer: Printer,
    camera: Camera,
    camera_system: Video,
    router: Router,
    switch: Network,
    phone: Phone,
    scanner: ScanLine,
    monitor: Monitor,
    tablet: Tablet,
    access_point: Wifi,
    nas: HardDrive,
    other: HelpCircle,
  };
  return map[type];
}
