import { apiFetch } from "../../../lib/http";

export type ItemKind = "COSMETIC" | "CONSUMABLE";

export type ItemCategory =
    | "AVATAR"
    | "BANNER"
    | "FRAME"
    | "EMOTE"
    | "BOARD_SKIN"
    | "CELL_SKIN"
    | "XP_BOOST";

export type ItemContext = "PROFILE" | "MATCH";

export type ItemEffect = {
    type: "XP_BOOST_PCT";
    magnitude?: number;
    durationMinutes?: number;
};

export type ItemDefinition = {
    itemId: string;
    name: string;
    kind: ItemKind;
    category: ItemCategory;
    contexts: ItemContext[];
    stackable: boolean;
    maxStack: number;
    consumable: boolean;
    effect?: ItemEffect | null;
    assetPath: string;
    version: number;
    available: boolean;
};

export type UserItem = {
    itemId: string;
    name: string;
    kind: ItemKind;
    category: ItemCategory;
    contexts: ItemContext[];
    quantity: number;
    equipped: boolean;
    acquiredAt: string;
    expiresAt: string | null;
    assetPath: string;
};

export type CreateItemRequest = {
    name: string;
    kind: ItemKind;
    category: ItemCategory;
    applicability?: ItemContext[];
    stackable?: boolean;
    maxStack?: number;
    consumable?: boolean;
    effect?: ItemEffect;
    assetPath?: string;
};

export type UpdateItemRequest = {
    name?: string;
    assetPath?: string;
    available?: boolean;
};

export type ItemFilters = {
    kind?: string;
    category?: string;
    context?: string;
    equipped?: boolean;
};

type UserItemsBody = {
    items: UserItem[];
};

function buildQuery(filters: ItemFilters): string {
    const params = new URLSearchParams();

    if (filters.kind) params.append("kind", filters.kind);
    if (filters.category) params.append("category", filters.category);
    if (filters.context) params.append("context", filters.context);
    if (filters.equipped !== undefined) params.append("equipped", String(filters.equipped));

    const query = params.toString();

    return query ? `?${query}` : "";
}

export class CosmeticRequests {
    static async createItem(body: CreateItemRequest) {
        return apiFetch<ItemDefinition>("/admin/items", {
            method: "POST",
            body
        });
    }

    static async updateItem(itemId: string, body: UpdateItemRequest) {
        return apiFetch<ItemDefinition>(`/admin/items/${encodeURIComponent(itemId)}`, {
            method: "PUT",
            body
        });
    }

    static async setAvailable(itemId: string, available: boolean) {
        return apiFetch<ItemDefinition>(`/admin/items/${encodeURIComponent(itemId)}`, {
            method: "PUT",
            body: { available }
        });
    }

    static async listItems(filters: ItemFilters = {}) {
        const body = await apiFetch<UserItemsBody>(`/user/items${buildQuery(filters)}`, {
            method: "GET"
        });

        return body.items;
    }

    static async getUserItems(userId: string, filters: ItemFilters = {}) {
        const body = await apiFetch<UserItemsBody>(`/user/${encodeURIComponent(userId)}/items${buildQuery(filters)}`, {
            method: "GET"
        });

        return body.items;
    }
}
