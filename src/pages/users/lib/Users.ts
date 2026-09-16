import { apiFetch } from "../../../lib/http";
import type { PageResponse } from "../../../lib/shared";
import type { CreateReward } from "../../../lib/Rewards";
import type { CoinType } from "../../offers/lib/Offers";
import type { ItemCategory, ItemKind } from "../../items/lib/Item";

export const ITEM_CATEGORIES: ItemCategory[] = [
    "AVATAR",
    "BANNER",
    "FRAME",
    "EMOTE",
    "BOARD_SKIN",
    "CELL_SKIN",
    "XP_BOOST",
    "RANKING_POINTS_BOOST",
    "COIN_BOOST",
    "RANKING_POINTS_PROTECTION",
    "CHANGE_NICKNAME"
];

export type BanType = "PERMANENT" | "TEMPORARY";

type BanInfo = {
    banned: boolean;
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

export type InventoryItem = {
    itemId: string;
    name: string;
    kind: ItemKind;
    category: ItemCategory;
    context: "PROFILE" | "MATCH";
    quantity: number;
    equipped: boolean;
    assetPath: string;
}

export type UserItem = {
    itemId: string;
    name: string;
    kind: ItemKind;
    category: ItemCategory;
    context: "PROFILE" | "MATCH";
    quantity: number;
    equipped: boolean;
    acquiredAt: string;
    expiresAt: string | null;
    assetPath: string;
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
    equipped: InventoryItem[];
    wallet: Wallet;
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

type UserItemsBody = {
    items: UserItem[];
}

export class UserRequests {
    static async getUsers(page: number, size: number) {
        return apiFetch<PageResponse<User>>(`/user?page=${page}&size=${size}`, {
            method: "GET"
        });
    }

    static async findUserByUsername(username: string, page = 0, size = 8) {
        return apiFetch<PageResponse<User>>(`/user/username/${encodeURIComponent(username)}?page=${page}&size=${size}`, {
            method: "GET"
        });
    }

    static async getUserInventory(userId: string) {
        const body = await apiFetch<UserItemsBody>(`/user/${encodeURIComponent(userId)}/items`, {
            method: "GET"
        });

        return body.items;
    }

    static async banUser(userId: string, body: BanUserRequest) {
        await apiFetch<Record<string, never>>(`/user/${encodeURIComponent(userId)}/ban`, {
            method: "PATCH",
            body
        });
    }

    static async unbanUser(userId: string) {
        await apiFetch<Record<string, never>>(`/user/${encodeURIComponent(userId)}/unban`, {
            method: "PATCH"
        });
    }

    static async grantReward(userId: string, reward: CreateReward) {
        await apiFetch<Record<string, never>>(`/user/${encodeURIComponent(userId)}/grant-reward`, {
            method: "PATCH",
            body: reward
        });
    }

    static async revokeUserItem(itemId: string) {
        await apiFetch<Record<string, never>>(`/user/items/${encodeURIComponent(itemId)}`, {
            method: "DELETE"
        });
    }

    static async revokeUserWallet(userId: string, remove: RevokeWallet) {
        await apiFetch<Record<string, never>>(`/user/${encodeURIComponent(userId)}/wallet/revoke`, {
            method: "PATCH",
            body: remove
        });
    }
}
