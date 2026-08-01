import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { LevelsRequests, type Level } from "./lib/Levels";
import { Table, type Column } from "../../components/Table/Table";
import { LevelDetailsModal } from "./components/LevelInfo/LevelDetailsModal";
import { CreateLevelPopup } from "./components/CreatePopup/CreateLevel";
import { EditLevelPopup } from "./components/EditPopup/EditLevel";
import styles from "./Levels.module.css";
import { useProfile } from "../../hooks/profile/useProfile";

export function LevelsPage() {
    const { notify } = useNotification();
    const { permissions } = useProfile();

    const [levels, setLevels] = useState<Level[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [canRegister, setCanRegister] = useState(false);
    const [canEdit, setCanEdit] = useState(false);

    useEffect(() => {
        const permission = permissions.find(p => p.key === "LEVELS");

        setCanRegister(permission?.actions.includes("CREATE") ?? false);
        setCanEdit(permission?.actions.includes("EDIT") ?? false);
        
    }, [permissions]);

    const fetchLevels = async () => {    
        try {
          const data = await LevelsRequests.getLevels(page, 5);
    
          setLevels(data.content);
          setTotalPages(data.totalPages);

        } catch (e) {
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

                <button 
                    className={`${styles.addButton} ${canRegister ? "" : styles.disabled}`} 
                    onClick={() => setIsCreateOpen(true)}
                    disabled={!canRegister}
                >
                    Novo Level
                </button>
            </header>

            <main className={styles.content}>
                <Table<Level>
                    data={levels}
                    columns={columns}
                    renderActions={(item) => (
                        <>
                            <button 
                                className={styles.actionButton} 
                                onClick={() => handleInspectLevel(item)}
                            >
                                Detalhes
                            </button>
                            
                            <button 
                                className={`${styles.actionButton} ${canEdit ? "" : styles.disabled}`} 
                                onClick={() => handleOpenEdit(item)}
                                disabled={!canEdit}
                            >
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