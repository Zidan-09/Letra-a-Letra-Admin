import type { CoinType } from "../pages/offers/lib/Offers";

export function normalizeCoinType(coinType: CoinType) {
    switch (coinType) {
        case "SOFT":
            return "MOEDAS";
        case "HARD":
            return "GEMAS";
        case "REAL":
            return "DINHEIRO";
    }
}