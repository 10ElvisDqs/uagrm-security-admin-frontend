export interface DeviceFingerprint {
  uuid_sistema: string;
  numero_serie_cpu: string;
  numero_serie_disco: string;
  baseboard_serial: string;
  bios_serial: string;
  mac_address: string;
  nombre_maquina: string;
}

export interface Device {
  id: string;
  device_hash: string;
  hostname: string;
  os: string;
  created_at: string;
}

export interface UserDevice {
  id: string;
  user: {
    username: string;
    first_name: string;
    last_name: string;
    email?: string;
  };
  device: Device;
  fingerprint: DeviceFingerprint | null;
  authorized: boolean;
  last_login: string | null;
  last_ip: string | null;
}

/**
 * Get all user devices (admin only)
 */
export const getDevices = async (): Promise<UserDevice[]> => {
  const response = await fetch('/api/admin/devices', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (response.status === 401) {
    // Session expired
    if (typeof window !== 'undefined') window.location.href = '/login?expired=true';
    return [];
  }

  if (!response.ok) {
    console.error("Failed to fetch devices:", await response.text());
    return [];
  }

  const data = await response.json();
  // Backend returns { success, status, results: [...] }
  return data.results || data.data || data || [];
};

/**
 * Authorize a device (admin only)
 */
export const authorizeDevice = async (deviceId: string): Promise<void> => {
  const response = await fetch(`/api/admin/devices/${deviceId}/authorize`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to authorize device");
  }
};

/**
 * Revoke/block a device (admin only)
 */
export const revokeDevice = async (deviceId: string): Promise<void> => {
  const response = await fetch(`/api/admin/devices/${deviceId}/revoke`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to revoke device");
  }
};
