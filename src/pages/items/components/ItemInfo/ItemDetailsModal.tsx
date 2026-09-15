import { useEffect } from "react";
import type { ItemDefinition } from "../../lib/Item";
import styles from "./ItemDetailsModal.module.css";

interface ItemDetailsInfoProps {
    isOpen: boolean;
    item: ItemDefinition | null;
    onClose: () => void;
}

export function ItemDetailsInfo({
    isOpen,
    item,
    onClose
}: ItemDetailsInfoProps) {
    useEffect(() => {
        if (!item || !isOpen) return;

        const listener = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", listener);

        return () => window.removeEventListener("keydown", listener);
    }, [item, isOpen, onClose]);

    if (!item || !isOpen) return null;

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
                            {item.kind} · {item.category}
                        </span>

                        <h2 className={styles.title}>
                            {item.name}
                        </h2>

                        <span className={styles.levelId}>
                            ID: {item.itemId}
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
                    {item.assetPath && (
                        <section className={styles.previewSection}>
                            <img
                                src={item.assetPath}
                                alt={item.name}
                                className={`${styles.preview} ${item.category === "BANNER" ? styles.banner : ""}`}
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

                                <strong>{item.name}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Tipo
                                </span>

                                <strong>{item.kind}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Categoria
                                </span>

                                <strong>{item.category}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Versão
                                </span>

                                <strong>v{item.version}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Disponível
                                </span>

                                <strong>{item.available ? "Sim" : "Não"}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Empilhável
                                </span>

                                <strong>{item.stackable ? `Sim${item.maxStack ? ` (máx. ${item.maxStack})` : ""}` : "Não"}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Consumível
                                </span>

                                <strong>{item.consumable ? "Sim" : "Não"}</strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Efeito
                                </span>

                                <strong>
                                    {item.effect
                                        ? `${item.effect.type} (+${item.effect.magnitude}% por ${item.effect.durationMinutes}min)`
                                        : "—"}
                                </strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Contextos
                                </span>

                                <strong>{item.contexts.join(", ")}</strong>
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
                                {item.assetPath || "—"}
                            </strong>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
