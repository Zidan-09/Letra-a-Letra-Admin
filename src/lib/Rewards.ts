import type { Cosmetic } from "../pages/cosmetics/lib/Cosmetic";
import type { RewardType } from "./shared";

export type CreateReward = {
    rewardType: RewardType;
    rewardReference: string;
    quantity: number;
}

export type Reward = RewardCoin | RewardGem | RewardCosmetic;

type RewardCoin = {
    type: "COIN";
    amount: number;
}

type RewardGem = {
    type: "GEMS";
    amount: number;
}

type RewardCosmetic = {
    type: "COSMETIC";
    amount: 1;
    cosmetic: Cosmetic;
}

export function convertReward(reward: Reward): CreateReward {
    return {
        rewardType: reward.type,
        rewardReference: reward.type === "COSMETIC" ? reward.cosmetic.id : "",
        quantity: reward.amount
    }
}