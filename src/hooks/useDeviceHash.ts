import { useState, useEffect } from 'react';

interface DeviceData {
  hash: string;
  componentes: any;
}

export const useDeviceHash = () => {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [isAgentActive, setIsAgentActive] = useState(false);

  useEffect(() => {
    const fetchHash = async () => {
      try {
        // Intentar conectar con el Agente Local (timeout corto)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

        const response = await fetch('http://localhost:8888/status', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.hash && data.componentes) {
             setDeviceData({
                hash: data.hash,
                componentes: data.componentes
             });
             setIsAgentActive(true);
          }
        }
      } catch (error) {
        console.log("Agente de seguridad no detectado.");
        setIsAgentActive(false);
      }
    };

    fetchHash();
  }, []);

  return { deviceData, isAgentActive };
};
