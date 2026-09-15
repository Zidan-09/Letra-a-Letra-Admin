import { type HttpResponse, API_URL } from "../../../lib/config";
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
    unlockedAt: string;
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
    positions: Record<string, string>;
    matches: MatchHistory[];
}

type PlayerHistory = {
    id: string;
    nickname: string;
    score: number;
    winner: boolean;
}

export type SpectatorHistory = {
    id: string;
    nickname: string;
}

type MatchHistory = {
    finishedAt: string;
    players: PlayerHistory[];
    spectators: SpectatorHistory[];
}

export class GamesRequests {
    static async getGames(page: number, size: number) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/game?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const response: HttpResponse<GetBody<Game>> = await res.json();

        if (!res.ok) throw new Error(response.message || "Erro ao carregar a lista de partidas.");

        return response.data;
    }

    static async getActiveGames(page: number, size: number) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/game/active?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const response: HttpResponse<GetBody<Game>> = await res.json();

        if (!res.ok) throw new Error(response.message || "Erro ao carregar a lista de partidas.");

        return response.data;
    }
}