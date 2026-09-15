import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { SearchBar } from "../Search/SearchBar";
import {
    ItemRequests,
    type ItemDefinition
} from "../../pages/items/lib/Item";
import type { CreateReward } from "../../lib/Rewards";
import type { RewardType } from "../../lib/shared";
import styles from "./RewardInput.module.css";

type RewardInputProps = {
    value: CreateReward;
    onChange: (reward: CreateReward) => void;
};

export function RewardInput({
    value,
    onChange
}: RewardInputProps) {

    const [results, setResults] = useState<ItemDefinition[]>([]);
    const [search, setSearch] = useState("");

    const { notify } = useNotification();

    const handleSearchItem = async () => {
        try {
            const page = await ItemRequests.listDefinitions(0, 20, { available: true });
            const term = search.trim().toLowerCase();

            setResults(
                page.content.filter((item) => item.name.toLowerCase().includes(term)).slice(0, 3)
            );
        } catch {
            setResults([]);
            notify.error(`Item "${search}" não encontrado.`);
        }
    };

    const handleSelectItem = (item: ItemDefinition) => {
        setSearch(item.name);
        setResults([]);

        onChange({
            rewardType: "ITEM",
            quantity: 1,
            rewardReference: item.itemId
        });
    };

    useEffect(() => {
        if (!search.trim()) {
            setResults([]);
        }

    }, [search]);

    return (
        <div className={styles.container}>
            <div className={styles.formGroup}>
                <label>Tipo</label>

                <select
                    className={styles.input}
                    value={value.rewardType}
                    onChange={(e) =>
                        onChange({
                            rewardType: e.target.value as RewardType,
                            quantity: 1,
                            rewardReference: ""
                        })
                    }
                >
                    <option value="COIN">Moedas</option>
                    <option value="GEMS">Gemas</option>
                    <option value="ITEM">Item</option>
                </select>
            </div>

            {value.rewardType !== "ITEM" && (
                <div className={styles.formGroup}>
                    <label>Quantidade</label>

                    <input
                        className={styles.input}
                        type="text"
                        value={value.quantity.toString().replace(/^0+(?!$)/, "")}
                        onChange={(e) => {
                            const tValue = e.target.value;

                            if (tValue === "" || Number(tValue) >= 0) {
                                tValue.startsWith("0") ?
                                onChange({...value, quantity: Number(tValue.replace(/^0+(?!$)/, ""))}) :
                                onChange({...value, quantity: Number(tValue)});
                            }
                        }}
                    />
                </div>
            )}

            {value.rewardType === "ITEM" && (
                <div className={styles.formGroup}>
                    <label>Item</label>

                    <SearchBar
                        value={search}
                        placeholder="Digite o nome do item..."
                        onChange={(value) => {
                            setSearch(value);

                            onChange({
                                rewardType: "ITEM",
                                quantity: 1,
                                rewardReference: ""
                            });
                        }}
                        search={handleSearchItem}
                        variant="modal"
                        trigger="on-change"
                    />

                    {results.length > 0 && (
                        <div className={styles.searchResults}>
                            {results.map((item) => (
                                <button
                                    key={item.itemId}
                                    type="button"
                                    className={styles.searchItem}
                                    onClick={() => handleSelectItem(item)}
                                >
                                    <strong className={styles.itemName}>
                                        {item.name}
                                    </strong>

                                    <span className={styles.badge}>
                                        {item.category}
                                    </span>

                                    <span className={styles.statusActive}>
                                        ● {item.kind}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
