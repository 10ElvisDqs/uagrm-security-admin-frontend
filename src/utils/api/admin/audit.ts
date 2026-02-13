export interface AuditLog {
  id: string;
  user: string | null;
  user_details: {
    full_name?: string;
    username?: string;
    email: string;
  };
  email: string;
  action: 'LOGIN' | 'LOGOUT' | 'REFRESH' | 'LOGIN_FAILED' | 'SESSION_EXPIRED' | 'DEVICE_MISMATCH';
  timestamp: string;
  ip_address: string;
  user_agent: string;
  device_hash: string | null;
  details: any;
  success: boolean;
}

/**
 * Get all audit logs (admin only)
 * Supports filtering by action, user_id, device_hash and ip_address
 */
export const getAuditLogs = async (filters: {
  action?: string;
  user_id?: string;
  device_hash?: string;
  ip_address?: string;
} = {}): Promise<AuditLog[]> => {
  const queryParams = new URLSearchParams();
  if (filters.action) queryParams.append('action', filters.action);
  if (filters.user_id) queryParams.append('user_id', filters.user_id);
  if (filters.device_hash) queryParams.append('device_hash', filters.device_hash);
  if (filters.ip_address) queryParams.append('ip_address', filters.ip_address);

  const url = `/api/admin/audit-logs?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login?expired=true';
    return [];
  }

  if (!response.ok) {
    console.error("Failed to fetch audit logs:", await response.text());
    return [];
  }

  const data = await response.json();
  // Backend returns { success, status, results: [...] }
  return data.results || data.data || data || [];
};
