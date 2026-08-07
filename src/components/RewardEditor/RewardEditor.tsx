import { useState } from "react";
import type { CreateReward } from "../../lib/Rewards";
import { RewardCard } from "./RewardCard";
import { RewardModal } from "./RewardModal";
import styles from "./RewardEditor.module.css";

type RewardEditorProps = {
    value: CreateReward[];
    onChange: (rewards: CreateReward[]) => void;
    title?: string;
};

export function RewardEditor({
    value,
    onChange,
    title
}: RewardEditorProps) {

    const [modalOpen, setModalOpen] = useState(false);

    const handleCreateReward = (reward: CreateReward) => {
        if (reward.rewardType !== "COSMETIC") {
            const index = value.findIndex(
                r => r.rewardType === reward.rewardType
            );

            if (index !== -1) {
                const rewards = [...value];

                rewards[index] = {
                    ...rewards[index],
                    quantity: rewards[index].quantity + reward.quantity
                };

                onChange(rewards);
                return;
            }

            onChange([...value, reward]);
            return;
        }

        if (value.some(c => c.rewardReference === reward.rewardReference)) {
            return;
        }

        onChange([...value, reward]);
    };

    const handleDeleteReward = (index: number) => {
        onChange(
            value.filter((_, i) => i !== index)
        );
    };

    return (
        <>
            <div className={styles.container}>

                <div className={styles.header}>
                    <div>
                        <h3 className={styles.title}>
                            {title ?? "Recompensas"}
                        </h3>

                        <span className={styles.subtitle}>
                            {value.length} recompensa(s)
                        </span>
                    </div>

                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={() => setModalOpen(true)}
                    >
                        + Adicionar
                    </button>
                </div>

                {
                    value.length === 0 ? (

                        <div className={styles.emptyState}>
                            Nenhuma recompensa cadastrada.
                        </div>

                    ) : (

                        <div className={styles.list}>

                            {
                                value.map((reward, index) => (

                                    <RewardCard
                                        key={`${reward.rewardType}-${reward.rewardReference}-${index}`}
                                        reward={reward}
                                        onDelete={() => handleDeleteReward(index)}
                                    />

                                ))
                            }

                        </div>

                    )
                }

            </div>

            <RewardModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreate={handleCreateReward}
            />
        </>
    );
}