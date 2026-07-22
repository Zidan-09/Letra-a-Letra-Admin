import { useEffect, useRef } from "react";
import { useRealtime } from "../../hooks/websocket/useRealtime";
import { formatBytes, formatPercent } from "../../utils/bytesFormatter";
import styles from "./Dashboard.module.css";

export function DashboardPage() {
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const {
    system,
    application,
    logs,
    connected
  } = useRealtime();

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className={styles.container}>
      <div className={styles.dashboard}>

        <header className={styles.header}>
          <div>
            <h1>Console da API</h1>

            <div className={styles.statusWrapper}>
              <span
                className={`${styles.badge} ${
                  system?.health === "UP"
                    ? styles.online
                    : styles.offline
                }`}
              >
                API: {system?.health || "Buscando..."}
              </span>

              <span>
                WS: {connected ? "Conectado" : "Desconectado"}
              </span>
            </div>
          </div>
        </header>

        <section className={styles.grid}>

          <div className={styles.card}>
            <h2>Aplicação</h2>

            <div className={styles.metricGroup}>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>
                  Partidas Ativas
                </span>
                <span className={styles.metricValue}>
                  {application?.games ?? 0}
                </span>
              </div>

              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>
                  Total de Jogadores
                </span>
                <span className={styles.metricValue}>
                  {application?.players ?? 0}
                </span>
              </div>

              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>
                  Jogadores Online
                </span>
                <span className={styles.metricValueHighlight}>
                  {application?.online ?? 0}
                </span>
              </div>
            </div>
          </div>


          <div className={styles.card}>
            <h2>Processador & RAM</h2>

            <div className={styles.metricGroup}>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>
                  CPU (Aplicação)
                </span>

                <span className={styles.metricValue}>
                  {(system?.cpu.processUsage ?? 0).toFixed(1)}%
                </span>
              </div>


              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>
                  CPU (Sistema)
                </span>

                <span className={styles.metricValue}>
                  {(system?.cpu.systemUsage ?? 0).toFixed(1)}%
                </span>
              </div>


              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>
                  Uso de Memória
                </span>

                <span className={styles.metricValue}>
                  {system?.memory.used} MB /
                  {formatBytes(system?.memory.max)}
                  ({(system?.memory.usage ?? 0).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>


          <div className={styles.card}>
            <h2>Armazenamento</h2>

            <div className={styles.metricGroup}>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>
                  Espaço Total
                </span>

                <span className={styles.metricValue}>
                  {formatBytes(system?.storage.total)}
                </span>
              </div>

              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>
                  Espaço Livre
                </span>

                <span className={styles.metricValue}>
                  {formatBytes(system?.storage.free)}
                </span>
              </div>

              <div className={styles.metricRow}>
                <span className={styles.metricLabel}>
                  Uso de Disco
                </span>

                <span className={styles.metricValue}>
                  {formatBytes(system?.storage.usage)}
                  ({formatPercent(system?.storage.used)})
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

            <span className={styles.consoleTitle}>
              Console
            </span>
          </div>


          <div className={styles.consoleContainer}>
            {logs.length === 0 ? (
              <p className={styles.consolePlaceholder}>
                Aguardando logs e eventos da API...
              </p>
            ) : (
              logs.map((log, i) => (
                <p key={i} className={styles.consoleContent}>
                  <span className={styles.terminalPrompt}>
                    &gt;
                  </span>{" "}
                  {log}
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