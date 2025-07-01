import { makePiece } from "./pieces";

// Color types
export const WHITE = 0;
export const BLACK = 1;

// Piece types
export const EMPTY = 0;
export const PAWN = 1;
export const KNIGHT = 2;
export const BISHOP = 3;
export const ROOK = 4;
export const QUEEN = 5;
export const KING = 6;

export const WHITE_PAWN_CODE = makePiece(PAWN, WHITE);

export const SLIDING_PIECES: Set<number> = new Set([BISHOP, ROOK, QUEEN]);

// Castling rights
export const CASTLE_WHITE_KINGSIDE = 1;
export const CASTLE_WHITE_QUEENSIDE = 2;
export const CASTLE_BLACK_KINGSIDE = 4;
export const CASTLE_BLACK_QUEENSIDE = 8;

// Move flags
export const MOVE_NORMAL = 0;
export const MOVE_CAPTURE = 1 << 0;
export const MOVE_PROMOTION = 1 << 1;
export const MOVE_ENPASSANT = 1 << 2;
export const MOVE_CASTLE_KINGSIDE = 1 << 3;
export const MOVE_CASTLE_QUEENSIDE = 1 << 4;

// Piece encoding
export const COLOR_MASK = 8; // 0b1000
export const PIECE_MASK = 7; // 0b0111


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