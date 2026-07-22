import { useState, type ReactNode } from "react";
import { useWebSocket } from "../../hooks/websocket/useWebSocket";
import { WSS } from "../../lib/config";
import {
    RealtimeContext,
    type ApplicationMetrics,
    type SystemMetrics
} from "./RealtimeContext";
import { useAuth } from "../../hooks/auth/useAuth";

interface RealtimeProviderProps {
    children: ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
    const [application, setApplication] = useState<ApplicationMetrics>();
    const [system, setSystem] = useState<SystemMetrics>();
    const [logs, setLogs] = useState<string[]>([]);

    const { token } = useAuth();

    const { isConnected } = useWebSocket(token ? `${WSS}${token}` : "", {
        onMessage: (event) => {
            const data = JSON.parse(event.data);

            switch (data.event) {
                case "METRICS":
                    setApplication(data.application);
                    setSystem(data.system);
                    break;

                case "LOG":
                    setLogs((previous) => [
                        ...previous,
                        data.log
                    ]);
                    break;
            }
        }
    });

    return (
        <RealtimeContext.Provider
            value={{
                connected: isConnected,
                application,
                system,
                logs
            }}
        >
            {children}
        </RealtimeContext.Provider>
    );
}