import type { Device, User, SparePart, ActivityLog, Role } from '@/types';
import { mockDevices, mockUsers, mockSpareParts, mockActivity, adminCredentials, userCredentials } from '@/data/mockData';

const STORAGE_KEY = 'inv-data-v1';
const SESSION_KEY = 'inv-session-v1';

interface DataStore {
  devices: Device[];
  users: User[];
  spareParts: SparePart[];
  activity: ActivityLog[];
}

function loadStore(): DataStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DataStore;
  } catch { /* ignore */ }
  const store: DataStore = {
    devices: mockDevices,
    users: mockUsers,
    spareParts: mockSpareParts,
    activity: mockActivity,
  };
  saveStore(store);
  return store;
}

function saveStore(store: DataStore) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch { /* ignore */ }
}

let store = loadStore();

function delay(ms: number = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logActivity(actor: string, action: string, target: string) {
  store.activity.unshift({
    id: `act-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor,
    action,
    target,
  });
  saveStore(store);
}

export interface Session {
  userId: string;
  username: string;
  role: Role;
}

export const api = {
  async checkNetworkAccess(): Promise<{ allowed: boolean; ssid?: string; connectionType?: string }> {
    await delay(800);
    const allowed = Math.random() > 0.05;
    return {
      allowed,
      ssid: allowed ? 'COMPANY-INTERNAL-WIFI' : undefined,
      connectionType: allowed ? (Math.random() > 0.5 ? 'Wi-Fi' : 'Ethernet') : 'Unknown',
    };
  },

  async login(username: string, password: string): Promise<Session> {
    await delay(600);
    const isAdmin = username === adminCredentials.username && password === adminCredentials.password;
    const isUser = username === userCredentials.username && password === userCredentials.password;

    if (!isAdmin && !isUser) {
      const user = store.users.find(u => u.username === username || u.email === username);
      if (user && user.active && password === 'user123') {
        const session: Session = { userId: user.id, username: user.username, role: user.role };
        try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* ignore */ }
        logActivity(user.username, 'login', 'System');
        return session;
      }
      throw new Error('INVALID_CREDENTIALS');
    }

    const session: Session = {
      userId: isAdmin ? 'usr-1' : 'usr-2',
      username: isAdmin ? 'admin' : 'a.yilmaz',
      role: isAdmin ? 'admin' : 'user',
    };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* ignore */ }
    logActivity(session.username, 'login', 'System');
    return session;
  },

  getSession(): Session | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) as Session : null;
    } catch { return null; }
  },

  logout() {
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  },

  async getDevices(): Promise<Device[]> {
    await delay(200);
    return [...store.devices];
  },

  async getDevice(id: string): Promise<Device | null> {
    await delay(150);
    return store.devices.find(d => d.id === id || d.inventoryNumber === id) || null;
  },

  async saveDevice(device: Device, actor: string): Promise<Device> {
    await delay(400);
    const idx = store.devices.findIndex(d => d.id === device.id);
    if (idx >= 0) {
      device.updatedAt = new Date().toISOString();
      store.devices[idx] = device;
      logActivity(actor, 'device_updated', device.inventoryNumber);
    } else {
      device.id = `dev-${Date.now()}`;
      device.createdAt = new Date().toISOString();
      device.updatedAt = new Date().toISOString();
      store.devices.push(device);
      logActivity(actor, 'device_added', device.inventoryNumber);
    }
    saveStore(store);
    return device;
  },

  async deleteDevice(id: string, actor: string): Promise<void> {
    await delay(300);
    const dev = store.devices.find(d => d.id === id);
    store.devices = store.devices.filter(d => d.id !== id);
    if (dev) logActivity(actor, 'device_deleted', dev.inventoryNumber);
    saveStore(store);
  },

  async getSpareParts(): Promise<SparePart[]> {
    await delay(200);
    return [...store.spareParts];
  },

  async saveSparePart(part: SparePart, actor: string): Promise<SparePart> {
    await delay(400);
    const idx = store.spareParts.findIndex(p => p.id === part.id);
    if (idx >= 0) {
      store.spareParts[idx] = part;
      logActivity(actor, 'spare_part_updated', part.sku);
    } else {
      part.id = `sp-${Date.now()}`;
      store.spareParts.push(part);
      logActivity(actor, 'spare_part_added', part.sku);
    }
    saveStore(store);
    return part;
  },

  async deleteSparePart(id: string, actor: string): Promise<void> {
    await delay(300);
    const part = store.spareParts.find(p => p.id === id);
    store.spareParts = store.spareParts.filter(p => p.id !== id);
    if (part) logActivity(actor, 'spare_part_deleted', part.sku);
    saveStore(store);
  },

  async adjustStock(id: string, newStock: number, actor: string): Promise<void> {
    await delay(300);
    const part = store.spareParts.find(p => p.id === id);
    if (part) {
      part.stock = Math.max(0, newStock);
      logActivity(actor, 'spare_part_adjusted', part.sku);
      saveStore(store);
    }
  },

  async markFaulty(id: string, faultyDelta: number, actor: string): Promise<void> {
    await delay(300);
    const part = store.spareParts.find(p => p.id === id);
    if (part) {
      part.faulty = Math.max(0, part.faulty + faultyDelta);
      logActivity(actor, 'spare_part_faulty', part.sku);
      saveStore(store);
    }
  },

  async getUsers(): Promise<User[]> {
    await delay(200);
    return [...store.users];
  },

  async grantAccess(identifier: string, role: Role, actor: string): Promise<User> {
    await delay(500);
    const existing = store.users.find(u => u.username === identifier || u.email === identifier);
    if (existing) {
      if (existing.role === role && existing.active) throw new Error('ALREADY_EXISTS');
      existing.role = role;
      existing.active = true;
      saveStore(store);
      logActivity(actor, 'user_granted', identifier);
      return existing;
    }
    const username = identifier.includes('@') ? identifier.split('@')[0] : identifier;
    const newUser: User = {
      id: `usr-${Date.now()}`,
      username,
      email: identifier.includes('@') ? identifier : `${username}@company.local`,
      fullName: username,
      role,
      department: 'Unassigned',
      active: true,
      createdAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    saveStore(store);
    logActivity(actor, 'user_granted', identifier);
    return newUser;
  },

  async revokeAccess(userId: string, actor: string): Promise<void> {
    await delay(400);
    const user = store.users.find(u => u.id === userId);
    if (user) {
      user.active = false;
      saveStore(store);
      logActivity(actor, 'user_revoked', user.username);
    }
  },

  async updateUser(user: User, actor: string): Promise<User> {
    await delay(400);
    const idx = store.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      store.users[idx] = user;
      saveStore(store);
      logActivity(actor, 'user_updated', user.username);
    }
    return user;
  },

  async getActivity(): Promise<ActivityLog[]> {
    await delay(200);
    return [...store.activity];
  },
};
