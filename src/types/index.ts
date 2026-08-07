export type Role = 'admin' | 'user';

export type DeviceType =
  | 'computer'
  | 'laptop'
  | 'server'
  | 'printer'
  | 'camera'
  | 'camera_system'
  | 'router'
  | 'switch'
  | 'phone'
  | 'scanner'
  | 'monitor'
  | 'tablet'
  | 'access_point'
  | 'nas'
  | 'other';

export type DeviceStatus = 'active' | 'faulty' | 'in_repair' | 'retired';

export type OSName =
  | 'Windows 11 Pro'
  | 'Windows 10 Pro'
  | 'Windows Server 2022'
  | 'Windows Server 2019'
  | 'Ubuntu 22.04 LTS'
  | 'macOS Sonoma'
  | 'macOS Ventura'
  | 'Debian 12'
  | 'None'
  | 'Proprietary';

export interface Printer {
  id: string;
  name: string;
  model: string;
  ip: string;
  mac: string;
  status: 'online' | 'offline';
}

export interface Camera {
  id: string;
  name: string;
  model: string;
  ip: string;
  mac: string;
  location: string;
  status: 'online' | 'offline';
}

export interface SparePart {
  id: string;
  name: string;
  sku: string;
  category: string;
  compatibleDevices: string[];
  stock: number;
  minStock: number;
  faulty: number;
  unitCost: number;
  supplier: string;
  location: string;
}

export interface Device {
  id: string;
  inventoryNumber: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  manufacturer: string;
  model: string;
  serialNumber: string;
  assignedUser: string;
  username: string;
  department: string;
  location: string;
  ip: string;
  mac: string;
  os: OSName;
  osVersion: string;
  cpu: string;
  ramGB: number;
  storageGB: number;
  storageType: 'SSD' | 'HDD' | 'NVMe' | 'N/A';
  gpu: string;
  purchaseDate: string;
  warrantyExpiry: string;
  vendor: string;
  notes: string;
  printers: Printer[];
  cameras: Camera[];
  cameraSystem: string;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  department: string;
  active: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
}
