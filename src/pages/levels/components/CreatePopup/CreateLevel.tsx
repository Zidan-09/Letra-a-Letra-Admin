import { useState, useEffect } from "react";
import { useNotification } from "../../../../hooks/notification/useNotification";
import { RewardEditor } from "../../../../components/RewardEditor/RewardEditor";
import { LevelsRequests, type CreateRequest } from "../../lib/Levels";
import styles from "./CreateLevel.module.css";

interface CreateLevelPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateLevelPopup({ isOpen, onClose }: CreateLevelPopupProps) {
    const [levelValue, setLevelValue] = useState<number>(0);
    const [rewards, setRewards] = useState<CreateRequest["rewards"]>([]);

    const { notify } = useNotification();

    useEffect(() => {
        setLevelValue(0);
        setRewards([]);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const level: CreateRequest = {
                level: levelValue,
                rewards
            };

            await LevelsRequests.createLevel(level);

            notify.success("Level cadastrado com sucesso!");

            setLevelValue(0);
            setRewards([]);

            onClose();
        } catch (err) {
            notify.error("Erro ao cadastrar Level");
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <form 
                className={styles.card} 
                onSubmit={handleSubmit}
                onClick={(e) => e.stopPropagation()}
            >
                <button type="button" className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>

                <h1>Criar Levels</h1>

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

                <button type="submit" className={styles.submit}>Cadastrar Level</button>
            </form>
        </div>
    );
}