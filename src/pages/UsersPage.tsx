import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { useAuth } from "@/auth/AuthContext";
import { useToast } from "@/components/ToastContext";
import { api } from "@/api/client";
import type { User, Role } from "@/types";
import {
  Card,
  Badge,
  Spinner,
  EmptyState,
  Button,
  Input,
  Select,
  Modal,
} from "@/components/ui";
import {
  Users,
  Search,
  UserPlus,
  Shield,
  ShieldOff,
  CheckCircle,
  XCircle,
  Mail,
  Lock,
} from "lucide-react";

export function UsersPage() {
  const { t } = useI18n();
  const { session } = useAuth();
  const { show } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantIdentifier, setGrantIdentifier] = useState("");
  const [grantRole, setGrantRole] = useState<Role>("user");
  const [editUser, setEditUser] = useState<User | null>(null);

  const load = () =>
    api.getUsers().then((u) => {
      setUsers(u);
      setLoading(false);
    });
  useEffect(() => {
    load();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  const handleGrant = async () => {
    if (!grantIdentifier.trim()) return;
    try {
      await api.grantAccess(
        grantIdentifier.trim(),
        grantRole,
        session?.username || "admin",
      );
      show(t.users.granted);
      setGrantOpen(false);
      setGrantIdentifier("");
      load();
    } catch (e) {
      show(t.users.alreadyExists, "error");
    }
  };

  const handleRevoke = async (user: User) => {
    if (user.id === session?.userId) {
      show(t.users.cannotRevokeSelf, "error");
      return;
    }
    if (!confirm(t.users.confirmRevoke)) return;
    await api.revokeAccess(user.id, session?.username || "admin");
    show(t.users.revoked);
    load();
  };

  const handleSaveUser = async (user: User) => {
    await api.updateUser(user, session?.username || "admin");
    show(t.users.saved);
    setEditUser(null);
    load();
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner className="text-blue-500 text-3xl" />
      </div>
    );

  const activeAdmins = users.filter(
    (u) => u.role === "admin" && u.active,
  ).length;

  return (
    <div className="space-y-4">
      {/* Admin-only notice */}
      <div className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-200 p-4">
        <Lock className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-slate-900">
            {t.users.adminOnly}
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            {t.users.selfGrantNote}
          </p>
        </div>
      </div>

      {/* Search & Grant */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.users.title}
            className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
        <Button onClick={() => setGrantOpen(true)}>
          <UserPlus className="h-4 w-4" /> {t.users.grantAccess}
        </Button>
      </div>

      {/* Users table */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title={t.users.noResults}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                    {t.users.fullName}
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                    {t.users.username}
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">
                    {t.users.email}
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">
                    {t.users.role}
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">
                    {t.users.department}
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">
                    {t.users.status}
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">
                    {t.common.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-900 uppercase">
                          {user.fullName.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-slate-500 md:hidden">
                            {user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-slate-400">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-slate-400">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      {user.role === "admin" ? (
                        <Badge variant="info">
                          <Shield className="h-3 w-3" /> {t.roles.admin}
                        </Badge>
                      ) : (
                        <Badge variant="neutral">{t.roles.user}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-sm text-slate-400">
                      {user.department}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.active ? (
                        <Badge variant="success">
                          <CheckCircle className="h-3 w-3" /> {t.users.active}
                        </Badge>
                      ) : (
                        <Badge variant="neutral">
                          <XCircle className="h-3 w-3" /> {t.users.inactive}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditUser(user)}
                        >
                          {t.common.edit}
                        </Button>
                        {user.active && user.id !== session?.userId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(user)}
                          >
                            <ShieldOff className="h-4 w-4 text-slate-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Grant access modal */}
      <Modal
        open={grantOpen}
        onClose={() => setGrantOpen(false)}
        title={t.users.grantAccess}
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
            <p className="text-sm text-slate-900">{t.users.grantDesc}</p>
          </div>
          <Input
            label={t.users.targetUser}
            value={grantIdentifier}
            onChange={setGrantIdentifier}
            placeholder="user@company.local or username"
            required
          />
          <Select
            label={t.users.role}
            value={grantRole}
            onChange={(v) => setGrantRole(v as Role)}
            options={[
              { value: "user", label: t.roles.user },
              { value: "admin", label: t.roles.admin },
            ]}
          />
          {grantRole === "admin" && (
            <div className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-200 p-3">
              <Shield className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600">{t.users.selfGrantNote}</p>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setGrantOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button className="flex-1" onClick={handleGrant}>
              <Mail className="h-4 w-4" /> {t.users.grant}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit user modal */}
      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title={t.users.edit}
        size="md"
      >
        {editUser && (
          <div className="space-y-4">
            <Input
              label={t.users.fullName}
              value={editUser.fullName}
              onChange={(v) => setEditUser({ ...editUser, fullName: v })}
            />
            <Input
              label={t.users.username}
              value={editUser.username}
              onChange={(v) => setEditUser({ ...editUser, username: v })}
            />
            <Input
              label={t.users.email}
              value={editUser.email}
              onChange={(v) => setEditUser({ ...editUser, email: v })}
            />
            <Select
              label={t.users.role}
              value={editUser.role}
              onChange={(v) => setEditUser({ ...editUser, role: v as Role })}
              options={[
                { value: "user", label: t.roles.user },
                { value: "admin", label: t.roles.admin },
              ]}
            />
            <Input
              label={t.users.department}
              value={editUser.department}
              onChange={(v) => setEditUser({ ...editUser, department: v })}
            />
            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setEditUser(null)}
              >
                {t.common.cancel}
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleSaveUser(editUser)}
              >
                {t.common.save}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
