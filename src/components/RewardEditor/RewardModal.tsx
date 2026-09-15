import { useEffect, useState } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { SearchBar } from "../Search/SearchBar";
import { ItemRequests, type UserItem } from "../../pages/items/lib/Item";
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

    const [results, setResults] = useState<UserItem[]>([]);
    const [_, setSelectedItem] = useState(false);

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

        if (!search.trim()) {
            setResults([]);
            setSelectedItem(false);
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

        if (rewardType === "ITEM" && rewardReference.trim() === "") {
            return;
        }

        onCreate({
            rewardType,
            quantity: rewardType !== "ITEM" ? amount : 1,
            rewardReference
        });

        onClose();
    };

    const handleSearchItem = async () => {
        try {
            const items = await ItemRequests.listItems();
            const term = search.trim().toLowerCase();

            setResults(
                items.filter((item) => item.name.toLowerCase().includes(term)).slice(0, 3)
            );

        } catch {
            setResults([]);
            notify.error(`Item ${search} não foi encontrado`);
        }
    }

    const handleSelectItem = (item: UserItem) => {
        setSearch(item.name);
        setRewardReference(item.itemId);
        setResults([]);
        setSelectedItem(true);
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

                            <option value="ITEM">
                                Item
                            </option>

                        </select>

                    </div>

                    {
                        rewardType !== "ITEM" && (
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
                        rewardType === "ITEM" && (

                            <div className={styles.section}>

                                <label className={styles.label}>
                                    Selecione o Item
                                </label>

                                <SearchBar
                                    value={search}
                                    placeholder="Digite o nome do item..."
                                    onChange={(value) => {
                                        setSearch(value)
                                        setSelectedItem(false);
                                        setRewardReference("");
                                    }}
                                    search={handleSearchItem}
                                    variant={"modal"}
                                    trigger={"on-change"}
                                />

                                {
                                    results.length > 0 && (
                                        <div className={styles.searchResults}>
                                            {
                                                results.map((item) => (
                                                    <button
                                                        key={item.itemId}
                                                        type="button"
                                                        className={styles.searchItem}
                                                        onClick={() => handleSelectItem(item)}
                                                    >
                                                        <strong className={styles.itemName}>{item.name}</strong>
                                                        <span className={styles.badge}>
                                                            {item.category}
                                                        </span>
                                                        <span className={styles.statusActive}>
                                                             ● x{item.quantity}
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
