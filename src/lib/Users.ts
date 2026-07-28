import { type HttpResponse, HTTPS } from "./config";
import type { GetBody } from "./shared";

type CosmeticType = "AVATAR" | "BANNER" | "EMOTE" | "FRAME";

type UserStats = {
    totalMatches: number;
    totalWins: number;
    winStreak: number;
    level: number;
    experience: number;
    points: number;
}

type ItemInventory = {
    cosmeticId: string;
    name: string;
    type: CosmeticType;
    equipped: boolean;
}

type Wallet = {
    coins: number;
    gems: number;
}

export type User = {
    userId: string;
    nickname: string;
    email: string;
    stats: UserStats;
    equipped: ItemInventory[];
    wallet: Wallet;
}

type FindBody = {
    user: User;
}

export class UserRequests {
    static async getUsers(page: number, size: number) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/user?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<GetBody<User>> = await res.json();

        return response.data;
    }

    static async findUserByUsername(username: string) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/user/username/${username}`, {
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
}