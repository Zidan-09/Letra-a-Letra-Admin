export type PageResponse<T> = {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export type GetBody<T> = PageResponse<T>;

export type RewardType = "COIN" | "GEMS" | "ITEM";