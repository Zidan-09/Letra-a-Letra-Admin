import { useState, useEffect } from "react";
import { useNotification } from "../../../../hooks/notification/useNotification";
import { type Level, type CreateRequest, LevelsRequests } from "../../lib/Levels";
import { RewardEditor } from "../../../../components/RewardEditor/RewardEditor";
import { convertReward } from "../../../../lib/Rewards";
import styles from "./EditLevel.module.css";

interface EditLevelPopupProps {
    isOpen: boolean;
    level: Level | null;
    onClose: () => void;
    onSuccess?: () => void;
}

export function EditLevelPopup({ isOpen, level, onClose, onSuccess }: EditLevelPopupProps) {
    const [levelValue, setLevelValue] = useState<number>(level?.value ?? 0);
    const [rewards, setRewards] = useState<CreateRequest["rewards"]>([]);

    const [loading, setLoading] = useState(false);

    const { notify } = useNotification();

    useEffect(() => {
        if (!level) return;

        setLevelValue(level.value);
        setRewards(level.rewards.map(lr => convertReward(lr.reward)));

    }, [level]);

    if (!isOpen || !level) return;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (loading) return;
        setLoading(true);

        try {
            const levelToSend: CreateRequest = {
                level: levelValue,
                rewards
            };

            await LevelsRequests.updateLevel(levelToSend, level.levelId);

            notify.success("Level atualizado com sucesso!");

            setLevelValue(0);
            setRewards([]);

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            notify.error("Erro ao atualizar Level");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${styles.overlay} ${loading ? styles.loading : ""}`} onClick={onClose}>
            <form 
                className={styles.card} 
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
            >
                <button type="button" className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>

                <h1>Atualizar Level</h1>

                <div className={styles.inputgroup}>
                    <label htmlFor="level-value" className={styles.label}>Valor</label>
                    <input
                        id="level-value"
                        className={styles.input}
                        type="text"
                        inputMode="numeric"
                        placeholder="Insira o valor do nível"
                        value={levelValue}
                        onChange={(e) => {
                            const value = e.target.value;

                            if (value === "" || Number(value) >= 0) {

                                value.startsWith("0") ? setLevelValue(Number(value.replace(/^0+(?!$)/, ""))) : setLevelValue(Number(value));

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

                <div className={styles.inputgroup}>
                    <RewardEditor
                        value={rewards}
                        onChange={setRewards}
                        title="Recompensas do Nível"
                    />
                </div>

                <button 
                    type="submit" 
                    className={`${styles.submit} ${loading ? styles.disabled : ""}`}
                    disabled={loading}
                >
                    Salvar Alterações
                </button>
            </form>
        </div>
    )
}