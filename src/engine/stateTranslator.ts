// FILE: src/engine/stateTranslator.ts

import { Game } from './Game';
import { UIGameState } from './api';
import { generateFen } from './fenGenerator';
import { indexToSquare } from './utils';
import { WHITE, BLACK, PAWN, KNIGHT, BISHOP, ROOK, QUEEN } from './constants';
import { makePiece } from './pieces';

// Define the starting piece counts for a standard game
const initialPieceCounts: { [key: number]: number } = {
    [PAWN]: 8,
    [KNIGHT]: 2,
    [BISHOP]: 2,
    [ROOK]: 2,
    [QUEEN]: 1,
};

// **FIX:** Define a specific type for the piece characters to ensure type safety.
type PieceChar = 'p' | 'n' | 'b' | 'r' | 'q';

// **FIX:** Use the PieceChar type in the mapping.
const pieceTypeToChar: { [key: number]: PieceChar } = {
    [PAWN]: 'p', [KNIGHT]: 'n', [BISHOP]: 'b', [ROOK]: 'r', [QUEEN]: 'q'
};

/**
 * Takes a Game instance and translates its state into the UIGameState object
 * required by the API contract.
 * @param game The internal Game instance.
 * @returns A UIGameState object for the UI to consume.
 */
export function createUIGameState(game: Game): UIGameState {
    const legalMoves = game.generateMoves();
    const sideToMove = game.gameState.sideToMove;

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

    // --- Generate Captured Pieces ---
    const capturedPieces: UIGameState['capturedPieces'] = {
        white: { p: 0, n: 0, b: 0, r: 0, q: 0 },
        black: { p: 0, n: 0, b: 0, r: 0, q: 0 }
    };

    // Loop through each piece type (excluding King)
    for (const pieceType of [PAWN, KNIGHT, BISHOP, ROOK, QUEEN]) {
        const char = pieceTypeToChar[pieceType];
        
        // Count white pieces captured by black
        const whitePieceCode = makePiece(pieceType, WHITE);
        const whiteCount = game.pieceList.count[whitePieceCode];
        capturedPieces.white[char] = initialPieceCounts[pieceType] - whiteCount;

        // Count black pieces captured by white
        const blackPieceCode = makePiece(pieceType, BLACK);
        const blackCount = game.pieceList.count[blackPieceCode];
        capturedPieces.black[char] = initialPieceCounts[pieceType] - blackCount;
    }

    // --- Generate Move History ---
    const history = game.moveHistory.map(historyEntry => {
        const move = historyEntry.move;
        const promotionChar = move.promotion ? pieceTypeToChar[move.promotion] : undefined;
        return {
            from: indexToSquare(move.from),
            to: indexToSquare(move.to),
            promotion: promotionChar
        };
    });

    // Determine Game Status
    const isCheck = game.isInCheck(sideToMove);
    const isMate = game.isCheckmate();
    const isStale = game.isStalemate();
    const is50Moved = game.isFiftyMoveRule();
    const isGameOver = game.isGameOver();

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
        isCheckmate: isMate,
        isStalemate: isStale,
        isDraw50Move: is50Moved,
        isGameOver: isGameOver,
        lastMove: lastMove,
        history: history,
        capturedPieces: capturedPieces
    };
}