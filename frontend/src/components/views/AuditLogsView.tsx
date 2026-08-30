import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, Clock } from 'lucide-react';
import { api } from '../../lib/api';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-400" />
          <span>Security & Activity Audit Trail</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Immutable audit record of all system events, state mutations, and AI recommendations.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 font-extrabold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity Type</th>
              <th className="p-3">Details / Mutation</th>
              <th className="p-3">User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-800/40">
                <td className="p-3 text-slate-400 font-mono text-[11px]">
                  {l.created_at ? new Date(l.created_at).toLocaleString('en-IN') : 'Just now'}
                </td>
                <td className="p-3 font-bold text-slate-200">
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px]">
                    {l.action}
                  </span>
                </td>
                <td className="p-3 text-slate-300 font-semibold">{l.object_type}</td>
                <td className="p-3 text-slate-400 text-[11px]">
                  {l.new_value || l.previous_value || 'State updated'}
                </td>
                <td className="p-3 text-slate-500 font-mono text-[11px]">{l.user_email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
