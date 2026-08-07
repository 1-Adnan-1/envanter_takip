import type {
  Device,
  User,
  SparePart,
  ActivityLog,
  Printer,
  Camera,
} from "@/types";

const manufacturers = [
  "Dell",
  "HP",
  "Lenovo",
  "Asus",
  "Acer",
  "Apple",
  "Cisco",
  "Ubiquiti",
  "Hikvision",
  "Samsung",
  "Synology",
  "Brother",
  "Canon",
];
const departments = [
  "IT",
  "HR",
  "Finance",
  "Operations",
  "Marketing",
  "Sales",
  "Engineering",
  "Security",
  "Reception",
  "Logistics",
];
const locations = [
  "Headquarters - Floor 1",
  "Headquarters - Floor 2",
  "Headquarters - Floor 3",
  "Warehouse A",
  "Warehouse B",
  "Server Room",
  "Branch Office",
  "Reception Desk",
  "Meeting Room",
  "Security Office",
];
const users = [
  "Ahmet Yılmaz",
  "Mehmet Demir",
  "Ayşe Kaya",
  "Fatma Şahin",
  "Mustafa Çelik",
  "Emre Öztürk",
  "Zeynep Arslan",
  "Can Aydın",
  "Elif Doğan",
  "Burak Kılıç",
  "Selin Yıldız",
  "Deniz Aksoy",
  "Gizem Koç",
  "Ozan Erdoğan",
  "Pınar Güneş",
  "Tolga Şen",
];
const usernames = [
  "a.yilmaz",
  "m.demir",
  "a.kaya",
  "f.sahin",
  "m.celik",
  "e.ozturk",
  "z.arslan",
  "c.aydin",
  "e.dogan",
  "b.kilic",
  "s.yildiz",
  "d.aksoy",
  "g.koc",
  "o.erdogan",
  "p.gunes",
  "t.sen",
];

const deviceTypes: Device["type"][] = [
  "computer",
  "laptop",
  "server",
  "printer",
  "camera",
  "camera_system",
  "router",
  "switch",
  "phone",
  "scanner",
  "monitor",
  "tablet",
  "access_point",
  "nas",
];
const oses: Device["os"][] = [
  "Windows 11 Pro",
  "Windows 10 Pro",
  "Windows Server 2022",
  "Windows Server 2019",
  "Ubuntu 22.04 LTS",
  "macOS Sonoma",
  "macOS Ventura",
  "Debian 12",
  "None",
  "Proprietary",
];
const statuses: Device["status"][] = [
  "active",
  "active",
  "active",
  "active",
  "active",
  "active",
  "active",
  "active",
  "faulty",
  "in_repair",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genMac(): string {
  const hex = "0123456789ABCDEF";
  let mac = "";
  for (let i = 0; i < 6; i++) {
    mac += hex[randInt(0, 15)] + hex[randInt(0, 15)];
    if (i < 5) mac += ":";
  }
  return mac;
}

function genIP(): string {
  return `10.0.${randInt(1, 50)}.${randInt(2, 254)}`;
}

function genDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function genInventoryNumber(i: number): string {
  return `INV-${String(i).padStart(5, "0")}`;
}

function genPrinters(): Printer[] {
  const count = randInt(0, 3);
  const printerModels = [
    "HP LaserJet Pro M404",
    "Brother HL-L2350DW",
    "Canon PIXMA TR4520",
    "Epson EcoTank ET-2760",
  ];
  const printers: Printer[] = [];
  for (let i = 0; i < count; i++) {
    printers.push({
      id: `prn-${Math.random().toString(36).slice(2, 8)}`,
      name: `Printer ${rand(locations).split(" - ")[0]}`,
      model: rand(printerModels),
      ip: genIP(),
      mac: genMac(),
      status: Math.random() > 0.2 ? "online" : "offline",
    });
  }
  return printers;
}

function genCameras(): Camera[] {
  const count = randInt(0, 4);
  const cameraModels = [
    "Hikvision DS-2CD2143G2",
    "Dahua IPC-HFW2231S",
    "Axis M3046-V",
    "Ubiquiti G3 Bullet",
  ];
  const cams: Camera[] = [];
  for (let i = 0; i < count; i++) {
    cams.push({
      id: `cam-${Math.random().toString(36).slice(2, 8)}`,
      name: `Camera-${randInt(1, 30)}`,
      model: rand(cameraModels),
      ip: genIP(),
      mac: genMac(),
      location: rand(locations),
      status: Math.random() > 0.15 ? "online" : "offline",
    });
  }
  return cams;
}

const deviceNames: Record<Device["type"], string[]> = {
  computer: ["OptiPlex", "ProDesk", "ThinkCentre", "Vostro", "EliteDesk"],
  laptop: ["Latitude", "ProBook", "ThinkPad", "ZenBook", "MacBook Pro"],
  server: ["PowerEdge", "ProLiant", "ThinkSystem"],
  printer: ["LaserJet", "WorkForce", "imageRUNNER"],
  camera: ["Dome Cam", "Bullet Cam", "PTZ Cam"],
  camera_system: ["NVR System", "DVR System", "Surveillance NVR"],
  router: ["ISR Router", "EdgeRouter", "UniFi Router"],
  switch: ["Catalyst", "UniFi Switch", "TL-SG"],
  phone: ["IP Phone", "Desk Phone"],
  scanner: ["ScanJet", "document Scanner"],
  monitor: ["UltraSharp", "ProDisplay", "ThinkVision"],
  tablet: ["Galaxy Tab", "iPad Pro", "Surface Go"],
  access_point: ["UniFi AP", "Aruba AP", "Aironet AP"],
  nas: ["Synology DS", "QNAP TS", "MyCloud"],
  other: ["Custom Device", "Generic Device"],
};

function genDevice(i: number): Device {
  const type = i < 35 ? deviceTypes[i % deviceTypes.length] : rand(deviceTypes);
  const manufacturer = rand(manufacturers);
  const baseName = rand(deviceNames[type]);
  const idx = randInt(0, users.length - 1);
  const hasOS = ["computer", "laptop", "server", "tablet"].includes(type);
  const status = rand(statuses);
  const isFaulty = status === "faulty" || status === "in_repair";

  return {
    id: `dev-${i}`,
    inventoryNumber: genInventoryNumber(i + 1),
    name: `${baseName}-${randInt(100, 999)}`,
    type,
    status,
    manufacturer,
    model: `${manufacturer} ${baseName} ${randInt(1000, 9999)}`,
    serialNumber: `${manufacturer.slice(0, 3).toUpperCase()}${randInt(100000, 999999)}`,
    assignedUser: Math.random() > 0.3 ? users[idx] : "",
    username: Math.random() > 0.3 ? usernames[idx] : "",
    department: rand(departments),
    location: rand(locations),
    ip: [
      "router",
      "switch",
      "access_point",
      "server",
      "nas",
      "printer",
      "camera",
      "camera_system",
    ].includes(type)
      ? genIP()
      : Math.random() > 0.5
        ? genIP()
        : "",
    mac: genMac(),
    os: hasOS
      ? rand(oses.filter((o) => o !== "None" && o !== "Proprietary"))
      : type === "router" || type === "switch" || type === "nas"
        ? rand(
            oses.filter(
              (o) =>
                o === "Proprietary" ||
                o === "Debian 12" ||
                o === "Ubuntu 22.04 LTS",
            ),
          )
        : "None",
    osVersion: hasOS ? `Version ${randInt(21, 23)}.${randInt(1, 5)}` : "",
    cpu: ["computer", "laptop", "server"].includes(type)
      ? `${rand(["Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "Intel Xeon"])} ${randInt(2, 16)} cores`
      : "N/A",
    ramGB: ["computer", "laptop", "server", "nas"].includes(type)
      ? rand([8, 16, 32, 64, 128])
      : 0,
    storageGB: ["computer", "laptop", "server", "nas"].includes(type)
      ? rand([256, 512, 1024, 2048, 4096, 8192])
      : 0,
    storageType: ["computer", "laptop", "server"].includes(type)
      ? rand(["SSD", "NVMe", "HDD"] as const)
      : "N/A",
    gpu: ["computer", "laptop"].includes(type)
      ? rand([
          "Intel UHD Graphics",
          "NVIDIA RTX 3060",
          "AMD Radeon RX 6700",
          "Intel Iris Xe",
          "NVIDIA Quadro RTX 4000",
        ])
      : "N/A",
    purchaseDate: genDate(randInt(100, 1500)),
    warrantyExpiry: genDate(randInt(-200, 800)),
    vendor: rand([
      "TechCorp A.Ş.",
      "DijitalDağıtım",
      "Bilişim Ltd.",
      "Global IT",
      "SistemNet",
      "DonanımPlus",
    ]),
    notes: isFaulty
      ? rand([
          "Hard disk failure",
          "Power supply issue",
          "Network card not detected",
          "Overheating problem",
          "Screen flickering",
          "RAM module faulty",
        ])
      : "",
    printers: type === "computer" || type === "laptop" ? genPrinters() : [],
    cameras: type === "camera_system" ? genCameras() : [],
    cameraSystem:
      type === "camera_system"
        ? `${rand(["Hikvision", "Dahua", "Axis"])} ${randInt(8, 64)}-Channel NVR`
        : "",
    lastSeen: genDate(randInt(0, 30)),
    createdAt: genDate(randInt(30, 500)),
    updatedAt: genDate(randInt(0, 30)),
  };
}

export const mockDevices: Device[] = Array.from({ length: 40 }, (_, i) =>
  genDevice(i),
);

export const mockUsers: User[] = [
  {
    id: "usr-1",
    username: "admin",
    email: "admin@company.local",
    fullName: "System Administrator",
    role: "admin",
    department: "IT",
    active: true,
    createdAt: genDate(800),
  },
  {
    id: "usr-2",
    username: "a.yilmaz",
    email: "a.yilmaz@company.local",
    fullName: "Ahmet Yılmaz",
    role: "user",
    department: "IT",
    active: true,
    createdAt: genDate(600),
  },
  {
    id: "usr-3",
    username: "m.demir",
    email: "m.demir@company.local",
    fullName: "Mehmet Demir",
    role: "user",
    department: "Finance",
    active: true,
    createdAt: genDate(400),
  },
  {
    id: "usr-4",
    username: "a.kaya",
    email: "a.kaya@company.local",
    fullName: "Ayşe Kaya",
    role: "user",
    department: "HR",
    active: true,
    createdAt: genDate(300),
  },
  {
    id: "usr-5",
    username: "f.sahin",
    email: "f.sahin@company.local",
    fullName: "Fatma Şahin",
    role: "user",
    department: "Operations",
    active: false,
    createdAt: genDate(200),
  },
];

export const mockSpareParts: SparePart[] = [
  {
    id: "sp-1",
    name: "1TB NVMe SSD",
    sku: "SSD-1TB-NVME",
    category: "Storage",
    compatibleDevices: ["computer", "laptop", "server"],
    stock: 12,
    minStock: 5,
    faulty: 2,
    unitCost: 1850,
    supplier: "TechCorp A.Ş.",
    location: "Warehouse A - Shelf 3",
  },
  {
    id: "sp-2",
    name: "16GB DDR4 RAM Module",
    sku: "RAM-16-DDR4",
    category: "Memory",
    compatibleDevices: ["computer", "laptop", "server"],
    stock: 8,
    minStock: 10,
    faulty: 1,
    unitCost: 750,
    supplier: "DijitalDağıtım",
    location: "Warehouse A - Shelf 1",
  },
  {
    id: "sp-3",
    name: "500GB SATA SSD",
    sku: "SSD-500-SATA",
    category: "Storage",
    compatibleDevices: ["computer", "laptop"],
    stock: 15,
    minStock: 5,
    faulty: 0,
    unitCost: 950,
    supplier: "Bilişim Ltd.",
    location: "Warehouse A - Shelf 3",
  },
  {
    id: "sp-4",
    name: "Power Supply Unit 500W",
    sku: "PSU-500W",
    category: "Power",
    compatibleDevices: ["computer", "server"],
    stock: 3,
    minStock: 5,
    faulty: 1,
    unitCost: 1200,
    supplier: "Global IT",
    location: "Warehouse B - Shelf 2",
  },
  {
    id: "sp-5",
    name: "Network Card PCIe",
    sku: "NIC-PCIE",
    category: "Network",
    compatibleDevices: ["computer", "server"],
    stock: 6,
    minStock: 3,
    faulty: 0,
    unitCost: 450,
    supplier: "SistemNet",
    location: "Warehouse A - Shelf 5",
  },
  {
    id: "sp-6",
    name: "HDD 4TB Enterprise",
    sku: "HDD-4TB-ENT",
    category: "Storage",
    compatibleDevices: ["server", "nas"],
    stock: 4,
    minStock: 3,
    faulty: 2,
    unitCost: 2200,
    supplier: "TechCorp A.Ş.",
    location: "Warehouse B - Shelf 1",
  },
  {
    id: "sp-7",
    name: "USB-C Cable 2m",
    sku: "CBL-USBC-2M",
    category: "Cables",
    compatibleDevices: ["laptop", "tablet", "phone"],
    stock: 25,
    minStock: 10,
    faulty: 0,
    unitCost: 120,
    supplier: "DonanımPlus",
    location: "Warehouse A - Shelf 7",
  },
  {
    id: "sp-8",
    name: "HDMI Cable 3m",
    sku: "CBL-HDMI-3M",
    category: "Cables",
    compatibleDevices: ["computer", "monitor"],
    stock: 18,
    minStock: 8,
    faulty: 0,
    unitCost: 95,
    supplier: "DonanımPlus",
    location: "Warehouse A - Shelf 7",
  },
  {
    id: "sp-9",
    name: "Laptop Battery 56Wh",
    sku: "BAT-LAP-56",
    category: "Battery",
    compatibleDevices: ["laptop"],
    stock: 2,
    minStock: 5,
    faulty: 0,
    unitCost: 980,
    supplier: "Bilişim Ltd.",
    location: "Warehouse B - Shelf 4",
  },
  {
    id: "sp-10",
    name: "Thermal Paste 4g",
    sku: "TP-4G",
    category: "Cooling",
    compatibleDevices: ["computer", "laptop", "server"],
    stock: 20,
    minStock: 5,
    faulty: 0,
    unitCost: 85,
    supplier: "SistemNet",
    location: "Warehouse A - Shelf 2",
  },
  {
    id: "sp-11",
    name: "Ethernet Cable Cat6 5m",
    sku: "CBL-ETH-CAT6-5M",
    category: "Cables",
    compatibleDevices: [
      "router",
      "switch",
      "access_point",
      "computer",
      "server",
    ],
    stock: 30,
    minStock: 10,
    faulty: 0,
    unitCost: 65,
    supplier: "DijitalDağıtım",
    location: "Warehouse A - Shelf 8",
  },
  {
    id: "sp-12",
    name: "Printer Cartridge Black",
    sku: "CRT-BLK-STD",
    category: "Consumables",
    compatibleDevices: ["printer"],
    stock: 14,
    minStock: 6,
    faulty: 3,
    unitCost: 340,
    supplier: "Global IT",
    location: "Warehouse B - Shelf 3",
  },
  {
    id: "sp-13",
    name: "Surveillance HDD 8TB",
    sku: "HDD-8TB-SURV",
    category: "Storage",
    compatibleDevices: ["camera_system", "nas"],
    stock: 5,
    minStock: 3,
    faulty: 1,
    unitCost: 3200,
    supplier: "TechCorp A.Ş.",
    location: "Warehouse B - Shelf 1",
  },
  {
    id: "sp-14",
    name: "WiFi Antenna 5dBi",
    sku: "ANT-WIFI-5DB",
    category: "Network",
    compatibleDevices: ["access_point", "router"],
    stock: 9,
    minStock: 4,
    faulty: 0,
    unitCost: 180,
    supplier: "SistemNet",
    location: "Warehouse A - Shelf 5",
  },
  {
    id: "sp-15",
    name: "Monitor Power Adapter",
    sku: "PWR-MON-ADT",
    category: "Power",
    compatibleDevices: ["monitor"],
    stock: 1,
    minStock: 4,
    faulty: 0,
    unitCost: 260,
    supplier: "DonanımPlus",
    location: "Warehouse B - Shelf 2",
  },
];

export const mockActivity: ActivityLog[] = [
  {
    id: "act-1",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actor: "admin",
    action: "login",
    target: "System",
  },
  {
    id: "act-2",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    actor: "admin",
    action: "device_added",
    target: "INV-00040",
  },
  {
    id: "act-3",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    actor: "a.yilmaz",
    action: "device_updated",
    target: "INV-00035",
  },
  {
    id: "act-4",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    actor: "admin",
    action: "spare_part_adjusted",
    target: "SSD-1TB-NVME",
  },
  {
    id: "act-5",
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    actor: "admin",
    action: "user_granted",
    target: "m.demir@company.local",
  },
  {
    id: "act-6",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    actor: "a.yilmaz",
    action: "device_viewed",
    target: "INV-00020",
  },
  {
    id: "act-7",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    actor: "admin",
    action: "device_marked_faulty",
    target: "INV-00015",
  },
  {
    id: "act-8",
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    actor: "admin",
    action: "spare_part_added",
    target: "HDD-8TB-SURV",
  },
];

export const adminCredentials = { username: "admin", password: "admin123" };
export const userCredentials = { username: "a.yilmaz", password: "user123" };
