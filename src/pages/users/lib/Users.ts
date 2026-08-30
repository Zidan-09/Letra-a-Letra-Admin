import { type HttpResponse, API_URL } from "../../../lib/config";
import type { GetBody } from "../../../lib/shared";
import type { CreateReward } from "../../../lib/Rewards";
import type { CoinType } from "../../offers/lib/Offers";

export const COSMETIC_TYPES = [
    "AVATAR",
    "BANNER",
    "EMOTE",
    "FRAME",
] as const;

export type CosmeticType = typeof COSMETIC_TYPES[number];

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
    rankingPoints: number;
}

export type ItemInventory = {
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

export type RevokeWallet = {
    type: CoinType;
    amount: number;
}

export class UserRequests {
    static async getUsers(page: number, size: number) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/user?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const response: HttpResponse<GetBody<User>> = await res.json();

        if (!res.ok) throw new Error(response.message);

        return response.data;
    }

    static async findUserByUsername(username: string) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/user/username/${username}`, {
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

    static async getUserInventory(userId: string, page: number, size: number) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/user/${userId}/inventory?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<GetBody<ItemInventory>> = await res.json();

        return response.data;
    }

    static async banUser(userId: string, body: BanUserRequest) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/user/${userId}/ban`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const response: HttpResponse<null> = await res.json();
            throw new Error(response.message);
        }
    }

    static async unbanUser(userId: string) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/user/${userId}/unban`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const response: HttpResponse<null> = await res.json();
            throw new Error(response.message);
        }
    }

    static async grantReward(userId: string, reward: CreateReward) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/user/${userId}/grant-reward`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(reward)
        });

        if (!res.ok) {
            const response: HttpResponse<null> = await res.json();
            throw new Error(response.message);
        }
    }

    static async revokeUserCosmetic(userId: string, cosmeticId: string) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/user/${userId}/inventory/${cosmeticId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const response: HttpResponse<null> = await res.json();
            throw new Error(response.message);
        }
    }

    static async revokeUserWallet(userId: string, remove: RevokeWallet) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/user/${userId}/wallet/revoke`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(remove)
        });

        if (!res.ok) {
            const response: HttpResponse<null> = await res.json();
            throw new Error(response.message);
        }
    }
}