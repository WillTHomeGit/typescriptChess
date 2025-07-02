import { Game } from './Game';
import { UIGameState } from './api';
import { generateFen } from './fenGenerator';
import { indexToSquare } from './utils';
import { WHITE, BLACK } from './constants';

/**
 * Takes a Game instance and translates its state into the UIGameState object
 * required by the API contract.
 * @param game The internal Game instance.
 * @returns A UIGameState object for the UI to consume.
 */
export function createUIGameState(game: Game): UIGameState {
    const legalMoves = game.generateMoves();
    const sideToMove = game.gameState.sideToMove;
    const opponentColor = sideToMove === WHITE ? BLACK : WHITE;

    // Create Dests Map for Chessground
    const dests = new Map<string, string[]>();
    for (const move of legalMoves) {
        const from = indexToSquare(move.from);
        const to = indexToSquare(move.to);
        if (!dests.has(from)) {
            dests.set(from, []);
        }
        if (!dests.get(from)!.includes(to)) {
            dests.get(from)!.push(to);
        }
    }

    // Determine Game Status
    const kingSquare = game.gameState.kingSquare[sideToMove];
    const isCheck = game.isSquareAttacked(kingSquare, opponentColor);
    const isGameOver = legalMoves.length === 0;

    // Get Last Move for Highlighting
    const lastHistory = game.moveHistory[game.moveHistory.length - 1];
    const lastMove = lastHistory ? { 
        from: indexToSquare(lastHistory.move.from),
        to: indexToSquare(lastHistory.move.to)
    } : undefined;

    // Assemble Final State Object
    return {
        fen: generateFen(game),
        turn: sideToMove === WHITE ? 'white' : 'black',
        dests: dests,
        isCheck: isCheck,
        isGameOver: isGameOver,
        lastMove: lastMove,
    };
}