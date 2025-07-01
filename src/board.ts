import { PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, WHITE, BLACK } from './constants';
import { makePiece } from './pieces';
import { addPiece, removePiece, movePiece, initializePieceListFromBoard, resetPieceList } from './pieceList';

// Converts 64-square indices to 120-square indices
export const mailbox64: Uint8Array  = new Uint8Array([
  21, 22, 23, 24, 25, 26, 27, 28,
  31, 32, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48,
  51, 52, 53, 54, 55, 56, 57, 58,
  61, 62, 63, 64, 65, 66, 67, 68,
  71, 72, 73, 74, 75, 76, 77, 78,
  81, 82, 83, 84, 85, 86, 87, 88,
  91, 92, 93, 94, 95, 96, 97, 98
]);

// Reverse lookup: 120-square index to 64-square index (-1 if off-board)
export const mailbox120: Int8Array = new Int8Array([
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1,  0,  1,  2,  3,  4,  5,  6,  7, -1,
    -1,  8,  9, 10, 11, 12, 13, 14, 15, -1,
    -1, 16, 17, 18, 19, 20, 21, 22, 23, -1,
    -1, 24, 25, 26, 27, 28, 29, 30, 31, -1,
    -1, 32, 33, 34, 35, 36, 37, 38, 39, -1,
    -1, 40, 41, 42, 43, 44, 45, 46, 47, -1,
    -1, 48, 49, 50, 51, 52, 53, 54, 55, -1,
    -1, 56, 57, 58, 59, 60, 61, 62, 63, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
]);

// The template for setting up a classical game of chess
const boardTemplate: Uint8Array = new Uint8Array([
    // Rank 1: White pieces
    makePiece(ROOK, WHITE),   makePiece(KNIGHT, WHITE), makePiece(BISHOP, WHITE), makePiece(QUEEN, WHITE),
    makePiece(KING, WHITE),   makePiece(BISHOP, WHITE), makePiece(KNIGHT, WHITE), makePiece(ROOK, WHITE),
    
    // Rank 2: White pawns  
    makePiece(PAWN, WHITE), makePiece(PAWN, WHITE), makePiece(PAWN, WHITE), makePiece(PAWN, WHITE),
    makePiece(PAWN, WHITE), makePiece(PAWN, WHITE), makePiece(PAWN, WHITE), makePiece(PAWN, WHITE),
    
    // Ranks 3-6: Empty
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    
    // Rank 7: Black pawns
    makePiece(PAWN, BLACK), makePiece(PAWN, BLACK), makePiece(PAWN, BLACK), makePiece(PAWN, BLACK),
    makePiece(PAWN, BLACK), makePiece(PAWN, BLACK), makePiece(PAWN, BLACK), makePiece(PAWN, BLACK),
    
    // Rank 8: Black pieces
    makePiece(ROOK, BLACK),   makePiece(KNIGHT, BLACK), makePiece(BISHOP, BLACK), makePiece(QUEEN, BLACK),
    makePiece(KING, BLACK),   makePiece(BISHOP, BLACK), makePiece(KNIGHT, BLACK), makePiece(ROOK, BLACK)
])

// The actual board that will change during gameplay.
export const board64: Uint8Array = new Uint8Array([...boardTemplate]);

// Helper functions for cleaner access
export function getPiece(square: number): number {
    return board64[square];
}

export function setPiece(square: number, piece: number): void {
    const oldPiece = board64[square];
    
    // Update piecelist
    if (oldPiece !== 0) {
        removePiece(square, oldPiece);
    }
    if (piece !== 0) {
        addPiece(square, piece);
    }
    
    board64[square] = piece;
}

export function isEmpty(square: number): boolean {
    return board64[square] === 0;
}

export function clearSquare(square: number): void {
    const piece = board64[square];
    if (piece !== 0) {
        removePiece(square, piece);
    }
    board64[square] = 0;
}

export function resetBoard(): void {
    // Reset the board array
    for (let index = 0; index < board64.length; index++) {
        board64[index] = boardTemplate[index];
    }
    
    // Reset and reinitialize the piecelist
    resetPieceList();
    initializePieceListFromBoard();
}