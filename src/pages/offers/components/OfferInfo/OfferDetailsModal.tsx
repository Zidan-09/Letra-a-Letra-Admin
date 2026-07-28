import { useEffect } from "react";
import type { Offer } from "../../../../lib/Offers";
import { RewardCard } from "../../../../components/RewardEditor/RewardCard";
import styles from "./OfferDetailsModal.module.css";

interface OfferDetailsModalProps {
    isOpen: boolean;
    offer: Offer | null;
    onClose: () => void;
}

export function OfferDetailsModal({
    isOpen,
    offer,
    onClose
}: OfferDetailsModalProps) {

    useEffect(() => {
        if (!offer) return;

        const listener = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", listener);

        return () => window.removeEventListener("keydown", listener);
    }, [offer, onClose]);

    if (!isOpen || !offer) return null;

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
                            OFERTA
                        </span>

                        <h2 className={styles.title}>
                            {offer.title}
                        </h2>

                        <span className={styles.offerId}>
                            ID: {offer.offerId}
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
                                    Preço
                                </span>

                                <strong>
                                    {offer.price}
                                </strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Moeda
                                </span>

                                <strong>
                                    {offer.coinType}
                                </strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Status
                                </span>

                                <strong>
                                    {offer.active ? "Ativa" : "Inativa"}
                                </strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Recompra
                                </span>

                                <strong>
                                    {offer.repeatable ? "Permitida" : "Única"}
                                </strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Recompensas
                                </span>

                                <strong>
                                    {offer.rewards.length}
                                </strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Expiração
                                </span>

                                <strong>
                                    {offer.hasExpiration ? "Sim" : "Não"}
                                </strong>
                            </div>

                            <div className={styles.infoCard}>
                                <span className={styles.infoLabel}>
                                    Expira em
                                </span>

                                <strong>
                                    {
                                        offer.hasExpiration
                                            ? new Date(offer.expiresAt).toLocaleString("pt-BR")
                                            : "-"
                                    }
                                </strong>
                            </div>

                        </div>

                    </section>

                    <section className={styles.section}>

                        <h3 className={styles.sectionTitle}>
                            Recompensas
                        </h3>

                        {
                            offer.rewards.length === 0
                                ? (
                                    <p className={styles.emptyText}>
                                        Esta oferta não possui recompensas.
                                    </p>
                                )
                                : (
                                    <div className={styles.rewardList}>

                                        {
                                            offer.rewards.map((reward) => (
                                                <RewardCard
                                                    key={reward.offerRewardId}
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