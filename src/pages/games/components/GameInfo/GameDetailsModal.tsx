import { useEffect } from "react";
import type { Game } from "../../lib/Games";
import styles from "./GameDetailsModal.module.css";

interface GameDetailsModalProps {
  game: Game | null;
  onClose: () => void;
}

export function GameDetailsModal({ game, onClose }: GameDetailsModalProps) {
  if (!game) return null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const hasMatches = game.matches && game.matches.length > 0;

  const positionsEntries: [string | number, string][] = game.positions
    ? game.positions instanceof Map
      ? Array.from(game.positions.entries())
      : Object.entries(game.positions as Record<string, string>)
    : [];

  const getStatusClass = (status: string) => {
    switch (status) {
      case "RUNNING": return styles.statusRunning;
      case "WAITING": return styles.statusActive;
      case "CANCELED": return styles.statusCanceled;
      default: return styles.statusFinished;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div>
            <span className={styles.typeBadge}>{game.type}</span>
            <h2 className={styles.title}>{game.gameName || "Partida sem nome"}</h2>
            <span className={styles.gameId}>ID: {game.gameId}</span>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </header>

        <div className={styles.body}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Status Geral</h3>
            <div className={styles.infoRow}>
              <span>Status Atual:</span>
              <span className={`${styles.badge} ${getStatusClass(game.status)}`}>
                ● {game.status}
              </span>
            </div>
          </section>

          {hasMatches ? (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Histórico de Partidas ({game.matches.length})</h3>
              <div className={styles.matchesList}>
                {game.matches.map((match, index) => (
                  <div key={index} className={styles.matchCard}>
                    <div className={styles.matchHeader}>
                      <span>Partida #{index + 1}</span>
                      <time className={styles.matchDate}>
                        {new Date(match.finishedAt).toLocaleString("pt-BR")}
                      </time>
                    </div>
                    <ul className={styles.playersList}>
                      {match.players?.map((player) => (
                        <li
                          key={player.id}
                          className={`${styles.playerRow} ${player.winner ? styles.winnerRow : ""}`}
                        >
                          <span className={styles.playerName}>
                            {player.winner && "🏆 "}
                            {player.nickname}
                          </span>
                          <span className={styles.playerScore}>{player.score} pts</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  Participantes ({game.participants?.length || 0})
                </h3>
                {game.participants && game.participants.length > 0 ? (
                  <div className={styles.participantsGrid}>
                    {game.participants.map((p) => (
                      <div key={p.id} className={styles.participantCard}>
                        <div className={styles.participantHeader}>
                          <strong className={styles.nickname}>{p.nickname}</strong>
                          <span className={styles.roleBadge}>{p.role}</span>
                          <span className={p.isConnected ? styles.connected : styles.disconnected}>{p.isConnected ? "● Conectado" : "● Desconectado"}</span>
                        </div>

                        {p.cosmeticsEquipped && p.cosmeticsEquipped.length > 0 && (
                          <div className={styles.cosmeticsContainer}>
                            <span className={styles.cosmeticsLabel}>Cosméticos Equipados:</span>
                            <div className={styles.cosmeticBadges}>
                              {p.cosmeticsEquipped.map((item) => (
                                <span key={item.cosmeticId} className={styles.cosmeticBadge}>
                                  {item.type}: <strong>{item.name}</strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyText}>Nenhum participante registrado no momento.</p>
                )}
              </section>

              {positionsEntries.length > 0 && (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Posições da Sala</h3>
                  <div className={styles.positionsList}>
                    {positionsEntries.map(([slot, playerId]) => (
                      <div key={slot} className={styles.positionBadge}>
                        <span>Slot {slot}:</span>
                        <strong>{playerId}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <footer className={styles.footer}>
          <button className={styles.confirmButton} onClick={onClose}>
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
};