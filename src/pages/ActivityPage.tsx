import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { api } from '@/api/client';
import type { ActivityLog } from '@/types';
import { Card, Spinner, EmptyState, Badge } from '@/components/ui';
import { History, Package, UserPlus, Wrench, LogIn, Trash2, Edit, ShieldOff, AlertTriangle } from 'lucide-react';

export function ActivityPage() {
  const { t } = useI18n();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getActivity().then(l => { setLogs(l); setLoading(false); }); }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="text-blue-600 text-3xl" /></div>;

  const getIcon = (action: string) => {
    switch (action) {
      case 'login': return LogIn;
      case 'device_added': return Package;
      case 'device_updated': return Edit;
      case 'device_deleted': return Trash2;
      case 'device_marked_faulty': return AlertTriangle;
      case 'user_granted': return UserPlus;
      case 'user_revoked': return ShieldOff;
      case 'spare_part_added': return Wrench;
      case 'spare_part_adjusted': return Wrench;
      case 'spare_part_faulty': return AlertTriangle;
      default: return History;
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-slate-400" />
        <h2 className="text-base font-semibold text-slate-900">{t.activity.title}</h2>
      </div>
      {logs.length === 0 ? (
        <EmptyState icon={<History className="h-8 w-8" />} title={t.activity.noResults} />
      ) : (
        <div className="space-y-1">
          {logs.map(log => {
            const Icon = getIcon(log.action);
            return (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 flex-shrink-0">
                  <Icon className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">
                    <span className="font-semibold">{log.actor}</span>
                    <span className="text-slate-500"> · {log.action.replace(/_/g, ' ')}</span>
                  </p>
                  <p className="text-xs text-slate-400">{log.target}</p>
                </div>
                <Badge variant="neutral">{formatTime(log.timestamp)}</Badge>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
