import { type HttpResponse, HTTPS } from "../../../lib/config";
import type { Reward, CreateReward } from "../../../lib/Rewards";
import type { GetBody } from "../../../lib/shared";

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
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/level?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<GetBody<Level>> = await res.json();

        return response.data;
    }

    static async findLevelByValue(value: number) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/level/value/${value}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<FindBody> = await res.json();

        return response.data;
    }

    static async findLevelById(id: string) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/level/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<FindBody> = await res.json();

        return response.data;
    }

    static async createLevel(level: CreateRequest) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/level`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                ...level
            })
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<Level> = await res.json();

        return response.data;
    }

    static async updateLevel(level: CreateRequest, levelId: string) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/level/${levelId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                ...level
            })
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<Level> = await res.json();

        return response.data;
    }
}