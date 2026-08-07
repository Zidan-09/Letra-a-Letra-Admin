import { useEffect } from "react";
import type { Cosmetic } from "../../lib/Cosmetic";
import styles from "./CosmeticDetailsModal.module.css";

interface CosmeticDetailsInfoProps {
    isOpen: boolean;
    cosmetic: Cosmetic | null;
    onClose: () => void;
}

export function CosmeticDetailsInfo({
    isOpen,
    cosmetic,
    onClose
}: CosmeticDetailsInfoProps) {
    useEffect(() => {
        if (!cosmetic || !isOpen) return;

        const listener = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", listener);

        return () => window.removeEventListener("keydown", listener);
    }, [cosmetic, isOpen, onClose]);

    if (!cosmetic || !isOpen) return null;

    const assetUrl = `https://pub-d49bc6f700bc45ba92fed050669b2690.r2.dev/${cosmetic.assetPath}`;

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
                            {cosmetic.type}
                        </span>

                        <h2 className={styles.title}>
                            {cosmetic.name}
                        </h2>

                        <span className={styles.levelId}>
                            ID: {cosmetic.id}
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
                    <section className={styles.previewSection}>
                        <img
                            src={assetUrl}
                            alt={cosmetic.name}
                            className={`${styles.preview} ${cosmetic.type === "BANNER" ? styles.banner : ""}`}
                        />
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            Informações
                        </h3>

                        <div className={styles.infoGrid}>
                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Nome
                                </span>

                                <strong>{cosmetic.name}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Tipo
                                </span>

                                <strong>{cosmetic.type}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Disponível
                                </span>

                                <strong>
                                    {cosmetic.available
                                        ? "Sim"
                                        : "Não"}
                                </strong>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h3 className={styles.sectionTitle}>
                            Asset
                        </h3>

                        <div className={styles.infoCard}>
                            <span className={styles.infoLabel}>
                                Caminho
                            </span>

                            <strong className={styles.path}>
                                {cosmetic.assetPath}
                            </strong>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}