import type { GameState, Move, MoveHistory } from './types';
import { PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, WHITE, BLACK } from './constants';
import { createInitialGameState } from './types';
import { board64, mailbox64, mailbox120, resetBoard, getPiece, setPiece } from './board';
import { makePiece } from './pieces';
import { drawBoardTerminal } from './ui/draw';
import { isSquareAttacked } from './checks';
import { debugPieceList } from './pieceList';
import { generateAllMoves } from './generateMoves';

export function hasCastleRight(flags: number, right: number): boolean {
    return (flags & right) !== 0;
}

// Helper function to reset the gameState
export function resetGameState(): void {
    gameState = createInitialGameState();
}

export function resetGame(): void {
    resetGameState();
    resetBoard(); // This now also handles piecelist reset
}

// Create initial global states for moves and moveHistory
export const moveHistory: MoveHistory[] = [];
export const moves: Move[] = [];

export let gameState: GameState = createInitialGameState();

// Initialize everything
resetBoard();

console.log(getPiece(0));
console.log(setPiece(16, makePiece(QUEEN, WHITE)));
console.log(getPiece(63));
console.log("Mailbox120 coordinate of position 16 on board64: ", mailbox64[16]);
console.log("board64 / Mailbox64 coordinate of position 16 on mailbox120: ", mailbox120[16]);

console.log(drawBoardTerminal());

console.log(isSquareAttacked(49));

debugPieceList();

generateAllMoves();