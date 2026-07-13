import { useState, useEffect } from "react";
import { Metrics } from "../../lib/Home";
import { useNotification } from "../../hooks/useNotification";
import styles from "./Home.module.css";

export function HomePage() {
    const { notify } = useNotification();

    const [appMetrics, setAppMetrics] = useState<{ 
        players: number,
        online: number, 
        games: number }
        >();

    const [sysMetrics, setSysMetrics] = useState<{ 
        uptime: number, 
        cpu: { systemUsage: number, processUsage: number }, 
        memory: { used: number, max: number, usage: number }, 
        storage: { used: number, free: number, total: number, usage: number }, 
        health: string}
        >();

    const fetchMetrics = async () => {
        try {
            const { players, online, games } = await Metrics.getApplication();
            const { uptime, cpu, memory, storage, health } = await Metrics.getSystem();

            setAppMetrics({ players, online, games });
            setSysMetrics({ uptime, cpu, memory, storage, health });

        } catch {
            notify.error("Error ao buscar as métricas do servidor");
        }
    }

    useEffect(() => {
        fetchMetrics();
    }, []);

    return (
        <main className={styles.container}>
            <p>Partidas: {appMetrics?.games}</p>
            <p>Jogadores: {appMetrics?.players}</p>
            <p>Online: {appMetrics?.online}</p>
            <p>Uso do processador (aplicação): {sysMetrics?.cpu.processUsage}</p>
            <p>Uso do processador (sistema):{sysMetrics?.cpu.systemUsage}</p>
            <p>Memória: {sysMetrics?.memory.max}</p>
            <p>Memória usada: {sysMetrics?.memory.used}</p>
            <p>Uso de memória: {(sysMetrics?.memory.usage)?.toFixed(1)}%</p>
            <p>Espaço livre: {sysMetrics?.storage.free}</p>
            <p>Espaço total: {sysMetrics?.storage.total}</p>
            <p>Espaço usado: {sysMetrics?.storage.usage}</p>
            <p>Uso de espaço: {(sysMetrics?.storage.used?.toFixed(1))}%</p>
            <p>Status da aplicação: {sysMetrics?.health}</p>

            <button className={styles.refetch} onClick={fetchMetrics}>
                refetch
            </button>
        </main>
    )
}