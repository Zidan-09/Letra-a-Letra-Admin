import { type HttpResponse, HTTPS } from "./config";

type Reward = {
    
}

type LevelReward = {
    levelRewardId: string;
    reward: any[];
}

export type Level = {
    levelId: string;
    level: number;
    rewards: LevelReward[];
}

type GetBody = {
    content: Level[];
    first: number;
    last: number;
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
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

        const response: HttpResponse<GetBody> = await res.json();

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

    static async createLevel(level: Level) {
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

        const response: HttpResponse<FindBody> = await res.json();

        return response.data;
    }
}