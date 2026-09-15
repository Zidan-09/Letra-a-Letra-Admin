export type GetBody<T> = {
    content: T[];
    first: boolean;
    last: boolean;
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export type RewardType = "COIN" | "GEMS" | "COSMETIC";