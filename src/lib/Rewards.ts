import type { RewardType } from "./shared";

export type CreateReward = {
    rewardType: RewardType;
    rewardReference: string;
    quantity: number;
}

export type Reward = RewardCoin | RewardGem | RewardItem;

type RewardCoin = {
    type: "COIN";
    amount: number;
}

type RewardGem = {
    type: "GEMS";
    amount: number;
}

type RewardItem = {
    type: "ITEM";
    amount: number;
    definitionId?: string;
}

export function convertReward(reward: Reward): CreateReward {
    return {
        rewardType: reward.type,
        rewardReference: reward.type === "ITEM" ? reward.definitionId ?? "" : "",
        quantity: reward.amount ?? 1
    }
}