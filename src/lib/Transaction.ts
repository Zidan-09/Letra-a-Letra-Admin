import { type HttpResponse, HTTPS } from "./config";
import type { GetBody } from "./shared";

type CoinType = "SOFT" | "HARD" | "REAL";

type OperationType = "CREDIT" | "DEBIT";

type TransactionReason = 
    "SHOP_PURCHASE" |
    "LEVEL_UP" |
    "ADMIN_GIVE" |
    "REFUND" |
    "DAILY_REWARD" |
    "RANKING_REWARD";

export type Transaction = {
    transactionId: string;
    userId: string;
    coinType: CoinType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    operation: OperationType;
    reason: TransactionReason;
    referenceId: string;
    transactionDate: Date
}

type FindBody = {
    transaction: Transaction;
}

export class TransactionRequests {
    static async getTransactions(page: number, size: number) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/transaction?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<GetBody<Transaction>> = await res.json();

        return response.data;
    }

    static async findTransactionById(transactionId: string) {
        const token = localStorage.getItem("token");
        
            const res = await fetch(`${HTTPS}/transaction/${transactionId}`, {
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

    static async findTransactionByUserId(userId: string) {
        const token = localStorage.getItem("token");
        
            const res = await fetch(`${HTTPS}/transaction/user/${userId}`, {
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