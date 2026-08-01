import { type HttpResponse, HTTPS } from "../../../lib/config";
import type { GetBody } from "../../../lib/shared";

type GameType = "CUSTOM" | "MATCHMAKING" | "RANKING";
export type GameStatus = "WAITING" | "RUNNING" | "CLOSED" | "CANCELED";
type Role = "PLAYER" | "SPECTATOR";
type CosmeticType = "AVATAR" | "BANNER" | "EMOTE" | "FRAME";

type InventoryItem = {
    cosmeticId: string;
    name: string;
    type: CosmeticType;
    equipped: boolean;
    unlockedAt: Date
}

type Participant = {
    id: string;
    nickname: string;
    cosmeticsEquipped: InventoryItem[];
    role: Role;
    isConnected: boolean;
}

export type Game = {
    gameId: string;
    gameName: string;
    type: GameType;
    status: GameStatus;
    participants: Participant[];
    positions: Map<number, string>;
    matches: MatchHistory[];
}

type Player = {
    id: string;
    nickname: string;
    score: number;
    winner: boolean;
}

type MatchHistory = {
    finishedAt: Date;
    players: Player[];
}

export class GamesRequests {
    static async getGames(page: number, size: number) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/game?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (!res.ok) throw new Error();

        const response = await res.json();

        console.log(response);

        return response.data;
    }

    static async getActiveGames(page: number, size: number) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${HTTPS}/game/active?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const response: HttpResponse<GetBody<Game>> = await res.json();

        console.log(response);

        return response.data;
    }
}