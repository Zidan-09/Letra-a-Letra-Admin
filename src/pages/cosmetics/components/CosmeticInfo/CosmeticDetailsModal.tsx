import { useEffect } from "react";
import type { UserItem } from "../../lib/Cosmetic";
import styles from "./CosmeticDetailsModal.module.css";

interface CosmeticDetailsInfoProps {
    isOpen: boolean;
    cosmetic: UserItem | null;
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
                            {cosmetic.category}
                        </span>

                        <h2 className={styles.title}>
                            {cosmetic.name}
                        </h2>

                        <span className={styles.levelId}>
                            ID: {cosmetic.itemId}
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
                    {cosmetic.assetPath && (
                        <section className={styles.previewSection}>
                            <img
                                src={cosmetic.assetPath}
                                alt={cosmetic.name}
                                className={`${styles.preview} ${cosmetic.category === "BANNER" ? styles.banner : ""}`}
                            />
                        </section>
                    )}

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
                                    Categoria
                                </span>

                                <strong>{cosmetic.category}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Quantidade
                                </span>

                                <strong>{cosmetic.quantity}</strong>
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
                                {cosmetic.assetPath || "—"}
                            </strong>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
