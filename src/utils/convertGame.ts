import type { Game, GameHistory } from "../lib/Games";

export function convertGame(game: GameHistory): Game {
    return {
        gameId: game.roomId,
        gameName: game.roomName,
        status: game.status,
        
    }
}