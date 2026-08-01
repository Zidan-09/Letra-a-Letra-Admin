import { useState, useEffect } from "react";
import { Table, type Column } from "../../components/Table/Table";
import { useNotification } from "../../hooks/notification/useNotification";
import { GamesRequests, type Game } from "./lib/Games";
import { GameDetailsModal } from "./components/GameInfo/GameDetailsModal";
import { RotateCcw } from "lucide-react";
import styles from "./Games.module.css";

export function GamesPage() {
  const { notify } = useNotification();

  const [games, setGames] = useState<Game[]>([]);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [rotating, setRotating] = useState(false);

  const fetchGames = async () => {
    if (rotating) return;

    setRotating(true);

    try {
      const data = showAll
        ? await GamesRequests.getGames(page, 5)
        : await GamesRequests.getActiveGames(page, 5);

      setGames(data.content);
      setTotalPages(data.totalPages);
      
    } catch (e) {
      notify.error("Erro ao carregar a lista de partidas.");
    } finally {
      setTimeout(() => setRotating(false), 500);
    }
  };

  const handleToggleShowAll = (value: boolean) => {
    setShowAll(value);
    setPage(0);
  };

  useEffect(() => {
    fetchGames();
  }, [page, showAll, games]);

  const columns: Column<Game>[] = [
    {
      header: "ID / Nome da Partida",
      render: (item) => (
        <div className={styles.gameInfo}>
          <strong className={styles.roomName}>{item.gameName || "Partida sem nome"}</strong>
          <span className={styles.gameId}>{item.gameId}</span>
        </div>
      ),
    },
    {
      header: "Participantes",
      render: (item) => (
        <div className={styles.participantsContainer}>
          <span className={styles.participantCount}>
            {item.participants?.length || 0} jogador(es)
          </span>
          {item.participants && item.participants.length > 0 && (
            <span className={styles.participantList}>
              {item.participants.map((p) => p.nickname).join(", ")}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      render: (item) => {
        const isRunning = item.status === "RUNNING";
        const isActive = item.status === "WAITING";
        const wasCanceled = item.status === "CANCELED";

        return (
          <span className={`${styles.badge} ${isRunning ? styles.statusRunning : isActive ? styles.statusActive : wasCanceled ? styles.statusCanceled : styles.statusFinished}`}>
            ● {item.status}
          </span>
        );
      },
    },
  ];

  const handleInspectGame = (item: Game) => {
    setSelectedGame(item);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Partidas</h1>
          <p>Acompanhe e monitore as partidas ativas ou o histórico completo do jogo.</p>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.refresh}
            onClick={fetchGames}
          >
            <RotateCcw className={rotating ? styles.rotating : ""} />
          </button>

          <div className={styles.filterGroup}>
            <button
              className={`${styles.filterButton} ${!showAll ? styles.filterActive : ""}`}
              onClick={() => handleToggleShowAll(false)}
            >
              Em Andamento
            </button>
            <button
              className={`${styles.filterButton} ${showAll ? styles.filterActive : ""}`}
              onClick={() => handleToggleShowAll(true)}
            >
              Todas as Partidas
            </button>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <Table<Game>
          data={games}
          columns={columns}
          renderActions={(item) => (
            <button className={styles.actionButton} onClick={() => handleInspectGame(item)}>
              Detalhes
            </button>
          )}
          page={page}
          totalPages={totalPages}
          nextPage={() => setPage((prev) => prev + 1)}
          prevPage={() => setPage((prev) => Math.max(0, prev - 1))}
        />
      </main>

      <GameDetailsModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
      />
    </div>
  );
}