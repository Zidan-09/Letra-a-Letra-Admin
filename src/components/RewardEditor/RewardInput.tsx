import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/notification/useNotification";
import { SearchBar } from "../Search/SearchBar";
import {
    CosmeticRequests,
    type Cosmetic
} from "../../pages/cosmetics/lib/Cosmetic";
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

    const [results, setResults] = useState<Cosmetic[]>([]);
    const [search, setSearch] = useState("");

    const { notify } = useNotification();

    const handleSearchCosmetic = async () => {
        try {
            const data = await CosmeticRequests.search(search, 0, 3);
            setResults(data.content);
        } catch {
            setResults([]);
            notify.error(`Cosmético "${search}" não encontrado.`);
        }
    };

    const handleSelectCosmetic = (cosmetic: Cosmetic) => {
        setSearch(cosmetic.name);
        setResults([]);

        onChange({
            rewardType: "COSMETIC",
            quantity: 1,
            rewardReference: cosmetic.id
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
                    <option value="COSMETIC">Cosmético</option>
                </select>
            </div>

            {value.rewardType !== "COSMETIC" && (
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

            {value.rewardType === "COSMETIC" && (
                <div className={styles.formGroup}>
                    <label>Cosmético</label>

                    <SearchBar
                        value={search}
                        placeholder="Digite o nome do cosmético..."
                        onChange={(value) => {
                            setSearch(value);

                            onChange({
                                rewardType: "COSMETIC",
                                quantity: 1,
                                rewardReference: ""
                            });
                        }}
                        search={handleSearchCosmetic}
                        variant="modal"
                        trigger="on-change"
                    />

                    {results.length > 0 && (
                        <div className={styles.searchResults}>
                            {results.map((cosmetic) => (
                                <button
                                    key={cosmetic.id}
                                    type="button"
                                    className={styles.searchItem}
                                    onClick={() => handleSelectCosmetic(cosmetic)}
                                >
                                    <strong className={styles.cosmeticName}>
                                        {cosmetic.name}
                                    </strong>

                                    <span
                                        className={`${styles.badge} ${
                                            styles[cosmetic.type.toLowerCase()] ??
                                            styles.defaultBadge
                                        }`}
                                    >
                                        {cosmetic.type}
                                    </span>

                                    <span
                                        className={
                                            cosmetic.available
                                                ? styles.statusActive
                                                : styles.statusDisabled
                                        }
                                    >
                                        ● {cosmetic.available ? "Ativo" : "Desativado"}
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