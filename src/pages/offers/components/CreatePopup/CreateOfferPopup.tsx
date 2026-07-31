import { useEffect, useState } from "react";
import { RewardEditor } from "../../../../components/RewardEditor/RewardEditor";
import { useNotification } from "../../../../hooks/notification/useNotification";
import { OfferRequests } from "../../lib/Offers";
import type { RewardType } from "../../../../lib/shared";
import styles from "./CreateOfferPopup.module.css";

type CoinType = "SOFT" | "HARD" | "REAL";

interface CreateOfferPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateOfferPopup({
    isOpen,
    onClose
}: CreateOfferPopupProps) {
    const [title, setTitle] = useState("");
    const [coinType, setCoinType] = useState<CoinType>("REAL");
    const [price, setPrice] = useState("0");
    const [repeatable, setRepeatable] = useState(false);
    const [hasExpiration, setHasExpiration] = useState(true);
    const [expiresIn, setExpiresIn] = useState(10);

    const [rewards, setRewards] = useState<
        {
            rewardType: RewardType;
            rewardReference: string;
            quantity: number;
        }[]
    >([]);

    const { notify } = useNotification();

    useEffect(() => {
        setTitle("");
        setCoinType("REAL");
        setPrice("0");
        setExpiresIn(10);
        setRewards([]);
    }, [isOpen]);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            await OfferRequests.createOffer({
                title,
                coinType,
                price: Number(price),
                repeatable,
                hasExpiration,
                expiresIn: hasExpiration ? expiresIn : 0,
                rewards
            });

            notify.success("Oferta cadastrada com sucesso!");

            onClose();
        } catch (err) {
            notify.error("Erro ao cadastrar oferta");
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <form
                className={styles.card}
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                >
                    &times;
                </button>

                <h1>Criar Oferta</h1>

                <div className={styles.inputgroup}>
                    <label className={styles.label}>Título</label>

                    <input
                        className={styles.input}
                        placeholder="Título da oferta"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.inputgroup}>
                    <label className={styles.label}>Moeda</label>

                    <select
                        className={styles.input}
                        value={coinType}
                        onChange={(e) =>
                            setCoinType(e.target.value as CoinType)
                        }
                    >
                        <option value="REAL">Dinheiro</option>
                        <option value="SOFT">Moedas</option>
                        <option value="HARD">Gemas</option>
                    </select>
                </div>

                <div className={styles.inputgroup}>
                    <label className={styles.label}>Preço</label>

                    <input
                        className={styles.input}
                        type="text"
                        inputMode={coinType === "REAL" ? "decimal" : "numeric"}
                        value={price}
                        placeholder="Preço"
                        onChange={(e) => {
                            let value = e.target.value.replace(",", ".");

                            if (coinType === "REAL") {
                                if (/^\d*\.?\d{0,2}$/.test(value)) {
                                    setPrice(value);
                                }
                            } else {
                                if (/^\d*$/.test(value)) {
                                    setPrice(value);
                                }
                            }
                        }}
                        onKeyDown={(e) => {
                            const blocked = ["-", "+", "e", "E"];

                            if (blocked.includes(e.key)) {
                                e.preventDefault();
                            }

                            if (coinType !== "REAL" && (e.key === "." || e.key === ",")) {
                                e.preventDefault();
                            }
                        }}
                        required
                    />
                </div>

                <div className={styles.checkboxGroup}>
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={repeatable}
                            onChange={(e) => setRepeatable(e.target.checked)}
                        />

                        Compra Repetível
                    </label>
                    
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={hasExpiration}
                            onChange={(e) => setHasExpiration(e.target.checked)}
                        />

                        Possui expiração
                    </label>
                </div>

                {hasExpiration && (
                    <div className={styles.inputgroup}>
                        <label className={styles.label}>
                            Tempo de Expiração (minutos)
                        </label>

                        <input
                            className={styles.input}
                            type="text"
                            inputMode="numeric"
                            value={expiresIn}
                            placeholder="Tempo em minutos"
                            onChange={(e) => {
                                const value = e.target.value;

                                if (value === "" || Number(value) >= 0) {
                                    setExpiresIn(
                                        Number(value.replace(/^0+(?!$)/, ""))
                                    );
                                }
                            }}
                            onKeyDown={(e) => {
                                if (["-", "+", "e", "E", "."].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            required
                        />
                    </div>
                )}

                <div className={styles.inputgroup}>
                    <RewardEditor
                        title="Recompensas da Oferta"
                        value={rewards}
                        onChange={setRewards}
                    />
                </div>

                <button className={styles.submit} type="submit">
                    Cadastrar Oferta
                </button>
            </form>
        </div>
    );
}