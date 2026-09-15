import { apiFetch } from "../../../lib/http";
import type { Reward, CreateReward } from "../../../lib/Rewards";
import type { PageResponse } from "../../../lib/shared";

type LevelReward = {
    levelRewardId: string;
    reward: Reward;
}

export type Level = {
    levelId: string;
    value: number;
    rewards: LevelReward[];
}

export type CreateRequest = {
    level: number;
    rewards: CreateReward[];
}

type FindBody = {
    level: Level;
}

export class LevelsRequests {
    static async getLevels(page: number, size: number) {
        return apiFetch<PageResponse<Level>>(`/level?page=${page}&size=${size}`, {
            method: "GET"
        });
    }

    static async findLevelByValue(value: number) {
        return apiFetch<FindBody>(`/level/value/${value}`, {
            method: "GET"
        });
    }

    static async findLevelById(id: string) {
        return apiFetch<FindBody>(`/level/${encodeURIComponent(id)}`, {
            method: "GET"
        });
    }

    static async createLevel(level: CreateRequest) {
        const body = await apiFetch<FindBody>("/level", {
            method: "POST",
            body: level
        });

        return body.level;
    }

    static async updateLevel(level: CreateRequest, levelId: string) {
        const body = await apiFetch<FindBody>(`/level/${encodeURIComponent(levelId)}`, {
            method: "PUT",
            body: level
        });

        return body.level;
    }
}
