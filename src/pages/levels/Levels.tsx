import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { LevelsRequests, type Level } from "../../lib/Levels";
import { Table, type Column } from "../../components/Table/Table";
import { LevelDetailsModal } from "./components/LevelInfo/LevelDetailsModal";
import { CreateLevelPopup } from "./components/CreatePopup/CreateLevel";
import { EditLevelPopup } from "./components/EditPopup/EditLevel";
import styles from "./Levels.module.css";

export function LevelsPage() {
    const { notify } = useNotification();

    const [levels, setLevels] = useState<Level[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const fetchLevels = async () => {    
        try {
          const data = await LevelsRequests.getLevels(page, 5);
    
          setLevels(data.content);
          setTotalPages(data.totalPages);

        } catch (e) {
          console.error(e);
          notify.error("Erro ao carregar a lista de níveis.");
        }
    };

    useEffect(() => {
        fetchLevels();
    }, [page]);

    const columns: Column<Level>[] = [
        {
            header: "ID / Valor do Nível",
            render: (item) => (
                <div className={styles.levelInfo}>
                    <strong className={styles.levelValue}>{item.value || "Valor de Level Inválido"}</strong>
                    <span className={styles.levelId}>{item.levelId}</span>
                </div>
            ),
        },
        {
            header: "Quantidade de Recompensas",
            render: (item) => (
                <div className={styles.rewardsQuantity}>
                    <span className={styles.rewardsCount}>
                        {item.rewards?.length || 0} recompensa(as)
                    </span>
                </div>
            ),
        },
    ];

    const handleInspectLevel = (item: Level) => {
        setIsModalOpen(true);
        setSelectedLevel(item);
    }

    const handleOpenEdit = (item: Level) => {
        setSelectedLevel(item);
        setIsEditOpen(true);
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1>Levels</h1>
                    <p>Gerencie, visualize e edite os níveis e suas recompensas ativas no sistema.</p>
                </div>

                <button className={styles.addButton} onClick={() => setIsCreateOpen(true)}>
                    Novo Level
                </button>
            </header>

            <main className={styles.content}>
                <Table<Level>
                    data={levels}
                    columns={columns}
                    renderActions={(item) => (
                        <>
                            <button className={styles.actionButton} onClick={() => handleInspectLevel(item)}>
                                Detalhes
                            </button>
                            
                            <button className={styles.actionButton} onClick={() => handleOpenEdit(item)}>
                                Editar
                            </button>
                        </>
                    )}
                    page={page}
                    totalPages={totalPages}
                    nextPage={() => setPage((prev) => prev + 1)}
                    prevPage={() => setPage((prev) => Math.max(0, prev - 1))}
                />   
            </main>

            <CreateLevelPopup
                isOpen={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    fetchLevels();
                }}
            />

            <EditLevelPopup
                isOpen={isEditOpen}
                level={selectedLevel}
                onClose={() => {
                    setIsEditOpen(false);
                    setSelectedLevel(null);
                }}
                onSuccess={() => fetchLevels()}
            />

            <LevelDetailsModal
                isOpen={isModalOpen}
                level={selectedLevel}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    )
}