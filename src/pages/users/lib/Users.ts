import { type HttpResponse, HTTPS } from "../../../lib/config";
import type { GetBody } from "../../../lib/shared";

type CosmeticType = "AVATAR" | "BANNER" | "EMOTE" | "FRAME";

export type BanType = "PERMANENT" | "TEMPORARY";

type BanInfo = {
    type: BanType | null;
    reason: string | null;
    expiresAt: string | null;
}

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
    banInfo: BanInfo;
    stats: UserStats;
    equipped: ItemInventory[];
    wallet: Wallet;
}

type FindBody = {
    user: User;
}

type BanUserRequest = {
    type: BanType;
    expiresIn?: number;
    reason: string;
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

    static async banUser(userId: string, body: BanUserRequest) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/user/${userId}/ban`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error();
    }

    static async unbanUser(userId: string) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/user/${userId}/unban`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();
    }
}