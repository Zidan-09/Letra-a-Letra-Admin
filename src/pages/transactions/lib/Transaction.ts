import { apiFetch } from "../../../lib/http";
import type { PageResponse } from "../../../lib/shared";

type CoinType = "SOFT" | "HARD" | "REAL";

type OperationType = "CREDIT" | "DEBIT";

export type TransactionReason =
    "SHOP_PURCHASE" |
    "LEVEL_UP" |
    "ADMIN_GIVE" |
    "ADMIN_REVOKE" |
    "REFUND" |
    "DAILY_REWARD" |
    "RANKING_REWARD";

export type Transaction = {
    transactionId: string;
    userId: string;
    username: string;
    coinType: CoinType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    operation: OperationType;
    reason: TransactionReason;
    referenceId: string;
    referenceType: string;
    referenceName: string
    transactionDate: string
}

type FindBody = {
    transaction: Transaction;
}

export class TransactionRequests {
    static async getTransactions(page: number, size: number) {
        return apiFetch<PageResponse<Transaction>>(`/transaction?page=${page}&size=${size}`, {
            method: "GET"
        });
    }

    static async findTransactionById(transactionId: string) {
        return apiFetch<FindBody>(`/transaction/${encodeURIComponent(transactionId)}`, {
            method: "GET"
        });
    }

    static async findTransactionByUserId(userId: string, page: number, size: number) {
        return apiFetch<PageResponse<Transaction>>(`/transaction/user/${encodeURIComponent(userId)}?page=${page}&size=${size}`, {
            method: "GET"
        });
    }

    static async findTransactionsByNickname(nickname: string, page: number, size: number) {
        return apiFetch<PageResponse<Transaction>>(`/transaction/user/username/${encodeURIComponent(nickname)}?page=${page}&size=${size}`, {
            method: "GET"
        });
    }
}
