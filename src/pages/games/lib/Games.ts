import { apiFetch } from "../../../lib/http";
import type { PageResponse } from "../../../lib/shared";
import { HttpError } from "../../../lib/http";

type GameType = "CUSTOM" | "MATCHMAKING" | "RANKING";
export type GameStatus = "WAITING" | "RUNNING" | "CLOSED" | "CANCELED";
type Role = "PLAYER" | "SPECTATOR";
type ItemCategory = "AVATAR" | "BANNER" | "FRAME" | "EMOTE" | "BOARD" | "CELL";

type EquippedCosmetic = {
    itemId: string;
    name: string;
    category: ItemCategory;
    equipped: boolean;
    assetPath: string;
}

type Participant = {
    id: string;
    nickname: string;
    cosmeticsEquipped: EquippedCosmetic[];
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
        try {
            return await apiFetch<PageResponse<Game>>(`/game?page=${page}&size=${size}`, {
                method: "GET"
            });
        } catch (err) {
            if (err instanceof HttpError) throw new Error(err.message || "Erro ao carregar a lista de partidas.", { cause: err });
            throw err;
        }
    }

    static async getActiveGames(page: number, size: number) {
        try {
            return await apiFetch<PageResponse<Game>>(`/game/active?page=${page}&size=${size}`, {
                method: "GET"
            });
        } catch (err) {
            if (err instanceof HttpError) throw new Error(err.message || "Erro ao carregar a lista de partidas.", { cause: err });
            throw err;
        }
    }
}
