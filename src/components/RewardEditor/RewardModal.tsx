import { useEffect, useState } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { SearchBar } from "../Search/SearchBar";
import { CosmeticRequests, type Cosmetic } from "../../pages/cosmetics/lib/Cosmetic";
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

    const [results, setResults] = useState<Cosmetic[]>([]);
    const [_, setSelectedCosmetic] = useState(false);

    const [search, setSearch] = useState("");

    const { notify } = useNotification();

    useEffect(() => {
        if (!open) {
            setRewardType("COIN");
            setQuantity("1");
            setRewardReference("");
        }
    }, [open]);

    useEffect(() => {
        console.log(search);

        if (!search.trim()) {
            console.log("Entro")
            setResults([]);
            setSelectedCosmetic(false);
        }

    }, [search]);

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

    const handleSearchCosmetic = async () => {
        try {
            const data = await CosmeticRequests.search(search, 0, 3);

            setResults(data.content);

        } catch {
            setResults([]);
            notify.error(`Cosmético ${search} não foi encontrado`);
        }
    }

    const handleSelectCosmetic = (cosmetic: Cosmetic) => {
        setSearch(cosmetic.name);
        setRewardReference(cosmetic.id);
        setResults([]);
        setSelectedCosmetic(true);
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
                                    Selecione o Cosmético
                                </label>

                                <SearchBar
                                    value={search}
                                    placeholder="Digite o nome do cosmético..."
                                    onChange={(value) => {
                                        setSearch(value)
                                        setSelectedCosmetic(false);
                                        setRewardReference("");
                                    }}
                                    search={handleSearchCosmetic}
                                    variant={"modal"}
                                    trigger={"on-change"}
                                />

                                {
                                    results.length > 0 && (
                                        <div className={styles.searchResults}>
                                            {
                                                results.map((cosmetic) => (
                                                    <button
                                                        key={cosmetic.id}
                                                        type="button"
                                                        className={styles.searchItem}
                                                        onClick={() => handleSelectCosmetic(cosmetic)}
                                                    >
                                                        <strong className={styles.cosmeticName}>{cosmetic.name}</strong>
                                                        <span className={`${styles.badge} ${styles[cosmetic.type.toLowerCase()] || styles.defaultBadge}`}>
                                                            {cosmetic.type}
                                                        </span>
                                                        <span className={cosmetic.available ? styles.statusActive : styles.statusDisabled}>
                                                             ● {cosmetic.available ? "Ativo" : "Desativado"}
                                                        </span>
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    )
                                }

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