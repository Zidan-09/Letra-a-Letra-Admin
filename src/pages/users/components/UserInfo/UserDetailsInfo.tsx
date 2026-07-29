import { useEffect } from "react";
import type { User } from "../../lib/Users";
import styles from "./UserDetailsInfo.module.css";

interface UserDetailsInfoProps {
    user: User | null;
    onClose: () => void;
}

export function UserDetailsInfo({ user, onClose }: UserDetailsInfoProps) {
    useEffect(() => {
        if (!user) return;

        const listener = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", listener);

        return () => window.removeEventListener("keydown", listener);
    }, [user, onClose]);

    if (!user) return;

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
                            USER
                        </span>

                        <h2 className={styles.title}>
                            Usuário: {user.nickname}
                        </h2>

                        <span className={styles.levelId}>
                            ID: {user.userId}
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
                            Estatísticas
                        </h3>

                        <div className={styles.infoGrid}>
                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>Nível</span>
                                <strong>{user.stats.level}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>Experiência</span>
                                <strong>{user.stats.experience} XP</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>Pontos</span>
                                <strong>{user.stats.points}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>Partidas</span>
                                <strong>{user.stats.totalMatches}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>Vitórias</span>
                                <strong>{user.stats.totalWins}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>Sequência</span>
                                <strong>{user.stats.winStreak}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>Taxa de Vitória</span>
                                <strong>
                                    {user.stats.totalMatches === 0
                                        ? "0%"
                                        : `${(
                                            (user.stats.totalWins / user.stats.totalMatches) *
                                            100
                                        ).toFixed(1)}%`}
                                </strong>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            Carteira
                        </h3>

                        <div className={styles.infoGrid}>
                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>Moedas</span>
                                <strong>{user.wallet.coins}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>Gemas</span>
                                <strong>{user.wallet.gems}</strong>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            Cosméticos Equipados
                        </h3>

                        {user.equipped.length === 0 ? (
                            <p className={styles.empty}>
                                Nenhum cosmético equipado.
                            </p>
                        ) : (
                            <div className={styles.infoGrid}>
                                {user.equipped.map((item) => (
                                    <div
                                        key={item.cosmeticId}
                                        className={styles.infoCard}
                                    >
                                        <span className={styles.infoLabel}>
                                            {item.type}
                                        </span>

                                        <strong>{item.name}</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}