import { Trash2 } from "lucide-react";
import type { CreateReward } from "../../lib/Rewards";
import styles from "./RewardCard.module.css";

type RewardCardProps = {
    reward: CreateReward;
    onDelete?: () => void;
};

export function RewardCard({
    reward,
    onDelete
}: RewardCardProps) {

    const getIcon = () => {
        switch (reward.rewardType) {
            case "COIN":
                return "🪙";

            case "GEMS":
                return "💎";

            case "COSMETIC":
                return "🎨";
        }
    };

    const getTitle = () => {
        switch (reward.rewardType) {
            case "COIN":
                return "Moedas";

            case "GEMS":
                return "Gemas";

            case "COSMETIC":
                return "Cosmético";
        }
    };

    const getDescription = () => {
        switch (reward.rewardType) {
            case "COIN":
                return `${reward.quantity} moedas`;

            case "GEMS":
                return `${reward.quantity} gemas`;

            case "COSMETIC":
                return reward.rewardReference;
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.left}>
                <div className={styles.icon}>
                    {getIcon()}
                </div>

                <div className={styles.content}>
                    <span className={styles.title}>
                        {getTitle()}
                    </span>

                    <span className={styles.description}>
                        {getDescription()}
                    </span>
                </div>
            </div>

            {onDelete && (
                <button
                    className={styles.deleteButton}
                    onClick={onDelete}
                    type="button"
                    aria-label="Remover recompensa"
                >
                    <Trash2 />
                </button>
            )}
        </div>
    );
}