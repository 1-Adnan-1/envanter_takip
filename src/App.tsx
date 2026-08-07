import { useState } from "react";
import { I18nProvider } from "@/i18n/I18nContext";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { ToastProvider } from "@/components/ToastContext";
import { Layout, type PageKey } from "@/components/Layout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DevicesPage } from "@/pages/DevicesPage";
import { DeviceDetailPage } from "@/pages/DeviceDetailPage";
import { DeviceFormPage } from "@/pages/DeviceFormPage";
import { SparePartsPage } from "@/pages/SparePartsPage";
import { UsersPage } from "@/pages/UsersPage";
import { ActivityPage } from "@/pages/ActivityPage";
import { ProfilePage } from "@/pages/ProfilePage";
import type { Device } from "@/types";

function AppContent() {
  const { session } = useAuth();
  const [page, setPage] = useState<PageKey>("dashboard");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  if (!session) return <LoginPage />;

  const handleNavigate = (p: PageKey) => {
    setSelectedDevice(null);
    setEditingDevice(null);
    setPage(p);
  };

  const handleSelectDevice = (d: Device) => {
    setSelectedDevice(d);
    setPage("devices");
  };

  const handleEditDevice = (d: Device) => {
    setEditingDevice(d);
    setPage("addDevice");
  };

  const isAdmin = session.role === "admin";

  // Guard admin-only pages
  const effectivePage: PageKey =
    (page === "addDevice" || page === "users" || page === "activity") &&
    !isAdmin
      ? "dashboard"
      : page;

  return (
    <Layout current={effectivePage} onNavigate={handleNavigate}>
      {effectivePage === "dashboard" && (
        <DashboardPage onNavigate={handleNavigate} />
      )}
      {effectivePage === "devices" && selectedDevice && (
        <DeviceDetailPage
          device={selectedDevice}
          onBack={() => setSelectedDevice(null)}
          onEdit={handleEditDevice}
        />
      )}
      {effectivePage === "devices" && !selectedDevice && (
        <DevicesPage onSelectDevice={handleSelectDevice} />
      )}
      {effectivePage === "addDevice" && (
        <DeviceFormPage
          existing={editingDevice}
          onDone={handleNavigate}
          onCancel={() => {
            setEditingDevice(null);
            handleNavigate("devices");
          }}
        />
      )}
      {effectivePage === "spareParts" && <SparePartsPage />}
      {effectivePage === "profile" && <ProfilePage />}
      {effectivePage === "users" && <UsersPage />}
      {effectivePage === "activity" && <ActivityPage />}
    </Layout>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
