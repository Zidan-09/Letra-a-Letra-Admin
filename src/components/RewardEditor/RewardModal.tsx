import { useEffect, useState } from "react";
import type { CreateReward } from "../../lib/Rewards";
import type { RewardType } from "../../lib/shared";
import styles from "./RewardModal.module.css";

type RewardModalProps = {
    open: boolean;
    onClose: () => void;
    onCreate: (reward: CreateReward) => void;
};

export function RewardModal({
    open,
    onClose,
    onCreate
}: RewardModalProps) {

    const [rewardType, setRewardType] = useState<RewardType>("COIN");
    const [quantity, setQuantity] = useState("1");
    const [rewardReference, setRewardReference] = useState("");

    useEffect(() => {
        if (!open) {
            setRewardType("COIN");
            setQuantity("1");
            setRewardReference("");
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const handleCreate = () => {

        const amount = Number(quantity);

        if (amount <= 0 || Number.isNaN(amount)) {
            return;
        }

        if (rewardType === "COSMETIC" && rewardReference.trim() === "") {
            return;
        }

        onCreate({
            rewardType,
            quantity: rewardType !== "COSMETIC" ? amount : 1,
            rewardReference
        });

        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                <header className={styles.header}>
                    <div>
                        <span className={styles.typeBadge}>
                            RECOMPENSA
                        </span>

                        <h2 className={styles.title}>
                            Nova recompensa
                        </h2>
                    </div>

                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                    >
                        ×
                    </button>
                </header>

                <div className={styles.body}>

                    <div className={styles.section}>

                        <label className={styles.label}>
                            Tipo
                        </label>

                        <select
                            className={styles.select}
                            value={rewardType}
                            onChange={(e) =>
                                setRewardType(e.target.value as RewardType)
                            }
                        >
                            <option value="COIN">
                                Moedas
                            </option>

                            <option value="GEMS">
                                Gemas
                            </option>

                            <option value="COSMETIC">
                                Cosmético
                            </option>

                        </select>

                    </div>

                    {
                        rewardType !== "COSMETIC" && (
                            <div className={styles.section}>

                                <label className={styles.label}>
                                    Quantidade
                                </label>

                                <input
                                    className={styles.input}
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(e.target.value)
                                    }
                                />

                        </div>
                        )
                    }

                    {
                        rewardType === "COSMETIC" && (

                            <div className={styles.section}>

                                <label className={styles.label}>
                                    ID do cosmético
                                </label>

                                <input
                                    className={styles.input}
                                    value={rewardReference}
                                    placeholder="UUID do cosmético"
                                    onChange={(e) =>
                                        setRewardReference(e.target.value)
                                    }
                                />

                            </div>

                        )
                    }

                </div>

                <footer className={styles.footer}>

                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={onClose}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className={styles.confirmButton}
                        onClick={handleCreate}
                    >
                        Adicionar recompensa
                    </button>

                </footer>

            </div>
        </div>
    );
}