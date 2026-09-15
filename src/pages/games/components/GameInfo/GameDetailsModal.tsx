import { useEffect } from "react";
import type { Game } from "../../lib/Games";
import styles from "./GameDetailsModal.module.css";

interface GameDetailsModalProps {
  game: Game | null;
  onClose: () => void;
}

function formatDateTime(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR");
}

export function GameDetailsModal({ game, onClose }: GameDetailsModalProps) {
  useEffect(() => {
    if (!game) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game, onClose]);

  if (!game) return null;

  const hasMatches = (game.matches?.length ?? 0) > 0;

  const positionsEntries: [string, string][] = game.positions
    ? Object.entries(game.positions as Record<string, string>)
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
              <h3 className={styles.sectionTitle}>Histórico de Partidas ({game.matches?.length ?? 0})</h3>
              <div className={styles.matchesList}>
                {game.matches.map((match, index) => {
                  const spectators = Array.isArray(match.spectators) ? match.spectators : [];
                  const players = Array.isArray(match.players) ? match.players : [];
                  return (
                  <div key={index} className={styles.matchCard}>
                    <div className={styles.matchHeader}>
                      <span>Partida #{index + 1}</span>
                      <time className={styles.matchDate}>
                        {formatDateTime(match.finishedAt)}
                      </time>
                    </div>
                    <ul className={styles.playersList}>
                      {players.map((player) => (
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
                    {spectators.length > 0 && (
                      <>
                        <div className={styles.spectatorsContainer}>
                          <span className={styles.itemsLabel}>Espectadores ({spectators.length}):</span>
                          <ul className={styles.playersList}>
                            {spectators.map((spectator) => (
                              <li key={spectator.id} className={styles.playerRow}>
                                <span className={styles.playerName}>{spectator.nickname}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                  );
                })}
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
                          <div className={styles.itemsContainer}>
                            <span className={styles.itemsLabel}>Itens Equipados:</span>
                            <div className={styles.itemBadges}>
                              {p.cosmeticsEquipped.map((item) => (
                                <span key={item.itemId} className={styles.itemBadge}>
                                  {item.category}: <strong>{item.name}</strong>
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