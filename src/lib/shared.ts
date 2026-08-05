export type GetBody<T> = {
    content: T[];
    first: number;
    last: number;
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export type RewardType = "COIN" | "GEMS" | "COSMETIC";