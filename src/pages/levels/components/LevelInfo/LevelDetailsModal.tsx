import { useEffect } from "react";
import type { Level } from "../../../../lib/Levels";
import { RewardCard } from "../../../../components/RewardEditor/RewardCard";
import styles from "./LevelDetailsModal.module.css";

interface LevelDetailsModalProps {
    isOpen: boolean;
    level: Level | null;
    onClose: () => void;
}

export function LevelDetailsModal({
    isOpen,
    level,
    onClose
}: LevelDetailsModalProps) {

    useEffect(() => {
        if (!level) return;

        const listener = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", listener);

        return () => window.removeEventListener("keydown", listener);
    }, [level, onClose]);

    if (!isOpen || !level) return;

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
        >
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >

                <header className={styles.header}>

                    <div>
                        <span className={styles.typeBadge}>
                            LEVEL
                        </span>

                        <h2 className={styles.title}>
                            Nível {level.value}
                        </h2>

                        <span className={styles.levelId}>
                            ID: {level.levelId}
                        </span>
                    </div>

                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                    >
                        &times;
                    </button>

                </header>

                <div className={styles.body}>

                    <section className={styles.section}>

                        <h3 className={styles.sectionTitle}>
                            Informações Gerais
                        </h3>

                        <div className={styles.infoGrid}>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Valor
                                </span>

                                <strong>
                                    {level.value}
                                </strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Recompensas
                                </span>

                                <strong>
                                    {level.rewards.length}
                                </strong>
                            </div>

                        </div>

                    </section>

                    <section className={styles.section}>

                        <h3 className={styles.sectionTitle}>
                            Recompensas
                        </h3>

                        {
                            level.rewards.length === 0
                            ? (
                                <p className={styles.emptyText}>
                                    Este nível não possui recompensas.
                                </p>
                            )
                            : (
                                <div className={styles.rewardList}>

                                    {
                                        level.rewards.map((reward) => (
                                            <RewardCard
                                                key={reward.levelRewardId}
                                                reward={{
                                                    rewardType: reward.reward.type,
                                                    quantity: reward.reward.amount,
                                                    rewardReference:
                                                        reward.reward.type === "COSMETIC"
                                                            ? reward.reward.cosmetic.id
                                                            : ""
                                                }}
                                            />
                                        ))
                                    }

                                </div>
                            )
                        }

                    </section>

                </div>

                <footer className={styles.footer}>

                    <button
                        className={styles.confirmButton}
                        onClick={onClose}
                    >
                        Fechar
                    </button>

                </footer>

            </div>
        </div>
    );
}