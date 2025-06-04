// Path: components/security/BlackLogTable.tsx

"use client";

import { BlacklistLog } from "@prisma/client";
import { format } from "date-fns";

interface AuditLogTableProps {
  logs: BlacklistLog[];
}

export function BlackLogTable({ logs }: AuditLogTableProps) {
  const getActionBadge = (action: string) => {
    const variantMap: Record<string, string> = {
      CREATE: "success",
      UPDATE: "warning",
      DELETE: "destructive",
      ACTIVATE: "success",
      DEACTIVATE: "destructive"
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs bg-${variantMap[action]}-100 text-${variantMap[action]}-800`}>
        {action}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map(log => (
            <tr key={log.id}>
              <td className="px-6 py-4 whitespace-nowrap">{getActionBadge(log.action)}</td>
              <td className="px-6 py-4 whitespace-nowrap">{log.user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{log.entityId}</td>
              <td className="px-6 py-4 whitespace-nowrap">{format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}</td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {log.oldData && (
                    <div>
                      <strong>Before:</strong>
                      <pre className="text-xs mt-1 p-2 bg-gray-100 rounded">
                        {JSON.stringify(log.oldData, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.newData && (
                    <div className="mt-2">
                      <strong>After:</strong>
                      <pre className="text-xs mt-1 p-2 bg-gray-100 rounded">
                        {JSON.stringify(log.newData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}