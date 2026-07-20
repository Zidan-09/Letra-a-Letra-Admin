import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "../../hooks/websocket/useWebSocket";
import { WSS } from "../../lib/config";
import { formatBytes, formatPercent } from "../../utils/bytesFormatter";
import styles from "./Home.module.css";

type WebSocketMessage = WebSocketLogs | WebSocketMetrics;

type WebSocketLogs = {
  event: "LOG";
  log: string;
}

type Cpu = { systemUsage: number, processUsage: number }
type Memory = { used: number, max: number, usage: number }
type Storage = { used: number, free: number, total: number, usage: number }

type WebSocketMetrics = {
  event: "METRICS";
  application: { users: number, usersOnline: number, games: number };
  system: { cpu: Cpu, health: string, memory: Memory, storage: Storage, uptime: number }
}

export function HomePage() {
  const token = localStorage.getItem("token");
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const { data, isConnected } = useWebSocket<WebSocketMessage>(`${WSS}${token}`, {
    onOpen: () => console.log('Conectado com sucesso!'),
    onClose: () => console.log('Conexão fechada.'),
    onError: (err) => console.error('Erro no WebSocket:', err),
  });

  const [appMetrics, setAppMetrics] = useState<{ 
    players: number,
    online: number, 
    games: number 
  }>();

  const [sysMetrics, setSysMetrics] = useState<{ 
    uptime: number, 
    cpu: { systemUsage: number, processUsage: number }, 
    memory: { used: number, max: number, usage: number }, 
    storage: { used: number, free: number, total: number, usage: number }, 
    health: string
  }>();

  const [consoleText, setConsoleText] = useState<string[]>([]);

  useEffect(() => {
    if (!data || !isConnected) return;

    if (data.event === "METRICS") {
      const { users, usersOnline, games } = data.application;
      const { uptime, cpu, memory, storage, health } = data.system;

      setAppMetrics({ players: users, online: usersOnline, games });
      setSysMetrics({ uptime, cpu, memory, storage, health });
    }

    if (data.event === "LOG") {
      setConsoleText(prev => [...prev, data.log]);
    }
  
  }, [data]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleText]);

  return (
    <main className={styles.container}>
      <div className={styles.dashboard}>
        
        <header className={styles.header}>
          <div>
            <h1>Console da API</h1>
            <div className={styles.statusWrapper}>
              <span className={`${styles.badge} ${sysMetrics?.health === "UP" ? styles.online : styles.offline}`}>
                API: {sysMetrics?.health || "Buscando..."}
              </span>
            </div>
          </div>
        </header>

        <section className={styles.grid}>
          
          <div className={styles.card}>
            <h2>Aplicação</h2>
            <div className={styles.metricGroup}>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Partidas Ativas</span>
                <span className={styles.metricValue}>{appMetrics?.games ?? 0}</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Total de Jogadores</span>
                <span className={styles.metricValue}>{appMetrics?.players ?? 0}</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Jogadores Online</span>
                <span className={styles.metricValueHighlight}>{appMetrics?.online ?? 0}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2>Processador & RAM</h2>
            <div className={styles.metricGroup}>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>CPU (Aplicação)</span>
                <span className={styles.metricValue}>{(sysMetrics?.cpu.processUsage ?? 0).toFixed(1)}%</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>CPU (Sistema)</span>
                <span className={styles.metricValue}>{(sysMetrics?.cpu.systemUsage ?? 0).toFixed(1)}%</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Uso de Memória</span>
                <span className={styles.metricValue}>
                  {sysMetrics?.memory.used} MB / {formatBytes(sysMetrics?.memory.max)} ({(sysMetrics?.memory.usage ?? 0).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2>Armazenamento</h2>
            <div className={styles.metricGroup}>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Espaço Total</span>
                <span className={styles.metricValue}>{formatBytes(sysMetrics?.storage.total)}</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Espaço Livre</span>
                <span className={styles.metricValue}>{formatBytes(sysMetrics?.storage.free)}</span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Uso de Disco</span>
                <span className={styles.metricValue}>
                  {formatBytes(sysMetrics?.storage.usage)} ({formatPercent(sysMetrics?.storage.used)})
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.consoleCard}>
          <div className={styles.consoleHeader}>
            <div className={styles.consoleDots}>
              <span className={styles.dotRed}></span>
              <span className={styles.dotYellow}></span>
              <span className={styles.dotGreen}></span>
            </div>
            <span className={styles.consoleTitle}>Console</span>
          </div>
          
          <div className={styles.consoleContainer}>
            {consoleText.length === 0 ? (
              <p className={styles.consolePlaceholder}>Aguardando logs e eventos da API...</p>
            ) : (
              consoleText.map((t, i) => (
                <p key={i} className={styles.consoleContent}>
                  <span className={styles.terminalPrompt}>&gt;</span> {t}
                </p>
              ))
            )}
            <div ref={consoleEndRef} />
          </div>
        </section>

      </div>
    </main>
  );
}