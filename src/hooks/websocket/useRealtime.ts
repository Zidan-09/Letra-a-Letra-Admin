import { useContext } from "react";
import { RealtimeContext } from "../../contexts/websocket/RealtimeContext";

export function useRealtime() {
    const context = useContext(RealtimeContext);

    if (!context)
        throw new Error(
            "useRealtime deve ser usado dentro de RealtimeProvider."
        );

    return context;
}