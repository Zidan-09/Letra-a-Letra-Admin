import { useEffect, useRef } from "react";
import { useRealtime } from "../../hooks/websocket/useRealtime";
import { formatBytes } from "../../utils/bytesFormatter";
import styles from "./Dashboard.module.css";

export function DashboardPage() {
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const { system, application, logs, connected } = useRealtime();

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [logs]);

  const ramPercent = system?.memory.usage ?? 0;
  const diskPercent = system?.storage.usage ?? 0;

  const cpuAppPercent = (system?.cpu.processUsage ?? 0) * 100;
  const cpuSysPercent = (system?.cpu.systemUsage ?? 0) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <div className={styles.titleWrapper}>
            <h1>Console da API</h1>
            <span className={styles.subtitle}>
              Painel de telemetria e monitoramento em tempo real
            </span>
          </div>

          <div className={styles.statusWrapper}>
            <span
              className={`${styles.badge} ${
                system?.health === "UP" ? styles.online : styles.offline
              }`}
            >
              API: {system?.health || "Buscando..."}
            </span>

            <span
              className={`${styles.badge} ${
                connected ? styles.online : styles.offline
              }`}
            >
              WS: {connected ? "Conectado" : "Desconectado"}
            </span>
          </div>
        </header>

        <section className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Jogadores Online</span>
            <div className={styles.kpiValueHighlight}>
              {application?.usersOnline ?? 0}
            </div>
            <span className={styles.kpiSubtext}>
              {application?.users ?? 0} cadastrados no total
            </span>
          </div>

          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Partidas Ativas</span>
            <div className={styles.kpiValue}>{application?.games ?? 0}</div>
            <span className={styles.kpiSubtext}>Em andamento agora</span>
          </div>

          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Uso da CPU (App)</span>
            <div className={styles.kpiValue}>
              {cpuAppPercent.toFixed(1)}%
            </div>
            <span className={styles.kpiSubtext}>
              CPU Sistema: {cpuSysPercent.toFixed(1)}%
            </span>
          </div>
        </section>

        <section className={styles.systemGrid}>
          <div className={styles.card}>
            <h2>Processador & RAM</h2>

            <div className={styles.metricGroup}>
              <div className={styles.metricBlock}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>Uso de Memória</span>
                  <span className={styles.metricValue}>
                    {formatBytes(system?.memory.used)} / {formatBytes(system?.memory.max)}
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.min(ramPercent, 100)}%` }}
                  />
                </div>
              </div>

              <div className={styles.metricBlock}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>Carga da CPU (Aplicação)</span>
                  <span className={styles.metricValue}>{cpuAppPercent.toFixed(1)}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.min(cpuAppPercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2>Armazenamento</h2>

            <div className={styles.metricGroup}>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Espaço Total</span>
                <span className={styles.metricValue}>
                  {formatBytes(system?.storage.total)}
                </span>
              </div>

              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Espaço Livre</span>
                <span className={styles.metricValue}>
                  {formatBytes(system?.storage.free)}
                </span>
              </div>

              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>Uso do Disco</span>
                <span className={styles.metricValue}>
                  {formatBytes(system?.storage.used)} ({diskPercent.toFixed(1)}%)
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

            <span className={styles.consoleTitle}>Console de Eventos</span>
          </div>

          <div className={styles.consoleContainer}>
            {logs.length === 0 ? (
              <p className={styles.consolePlaceholder}>
                Aguardando logs e eventos da API...
              </p>
            ) : (
              logs.map((log, i) => (
                <p key={i} className={styles.consoleContent}>
                  <span className={styles.terminalPrompt}>&gt;</span> {log}
                </p>
              ))
            )}
            <div ref={consoleEndRef} />
          </div>
        </section>
      </div>
    </div>
  );
}