// --- Colors ---
export const WHITE = 0;
export const BLACK = 1;

// --- Piece Types (encoded in the first 3 bits) ---
export const EMPTY = 0;
export const PAWN = 1;
export const KNIGHT = 2;
export const BISHOP = 3;
export const ROOK = 4;
export const QUEEN = 5;
export const KING = 6;

// --- Piece Encoding Masks ---
export const PIECE_MASK = 7; // 0b0111
export const COLOR_MASK = 8; // 0b1000

// --- Full Piece Codes (Type | Color) ---
// Note: color is bit-shifted: (color << 3)
export const WHITE_PAWN_CODE   = PAWN   | (WHITE << 3); // 1
export const WHITE_KNIGHT_CODE = KNIGHT | (WHITE << 3); // 2
export const WHITE_BISHOP_CODE = BISHOP | (WHITE << 3); // 3
export const WHITE_ROOK_CODE   = ROOK   | (WHITE << 3); // 4
export const WHITE_QUEEN_CODE  = QUEEN  | (WHITE << 3); // 5
export const WHITE_KING_CODE   = KING   | (WHITE << 3); // 6

export const BLACK_PAWN_CODE   = PAWN   | (BLACK << 3); // 9
export const BLACK_KNIGHT_CODE = KNIGHT | (BLACK << 3); // 10
export const BLACK_BISHOP_CODE = BISHOP | (BLACK << 3); // 11
export const BLACK_ROOK_CODE   = ROOK   | (BLACK << 3); // 12
export const BLACK_QUEEN_CODE  = QUEEN  | (BLACK << 3); // 13
export const BLACK_KING_CODE   = KING   | (BLACK << 3); // 14

// --- Move Flags (used for special moves) ---
export const MOVE_NORMAL = 0;
export const MOVE_CAPTURE = 1 << 0; // 1
export const MOVE_PROMOTION = 1 << 1; // 2
export const MOVE_ENPASSANT = 1 << 2; // 4
export const MOVE_CASTLE_KINGSIDE = 1 << 3; // 8
export const MOVE_CASTLE_QUEENSIDE = 1 << 4; // 16

// --- Castling Rights (bitmask) ---
export const CASTLE_WHITE_KINGSIDE = 1;  // 0b0001
export const CASTLE_WHITE_QUEENSIDE = 2; // 0b0010
export const CASTLE_BLACK_KINGSIDE = 4;  // 0b0100
export const CASTLE_BLACK_QUEENSIDE = 8; // 0b1000

// --- Square Offsets for Mailbox120 ---
export const KNIGHT_DIR_OFFSETS = [21, 19, 12, 8, -21, -19, -12, -8] as const;
export const DIAGONAL_DIR_OFFSETS = [-11, -9, 9, 11] as const;
export const ORTHOGONAL_DIR_OFFSETS = [-10, -1, 1, 10] as const;
export const CARDINAL_DIR_OFFSETS = [...DIAGONAL_DIR_OFFSETS, ...ORTHOGONAL_DIR_OFFSETS] as const;

// --- Square Names (64-based index) ---
export const SQUARES = {
    A1: 0,  B1: 1,  C1: 2,  D1: 3,  E1: 4,  F1: 5,  G1: 6,  H1: 7,
    A2: 8,  B2: 9,  C2: 10, D2: 11, E2: 12, F2: 13, G2: 14, H2: 15,
    A3: 16, B3: 17, C3: 18, D3: 19, E3: 20, F3: 21, G3: 22, H3: 23,
    A4: 24, B4: 25, C4: 26, D4: 27, E4: 28, F4: 29, G4: 30, H4: 31,
    A5: 32, B5: 33, C5: 34, D5: 35, E5: 36, F5: 37, G5: 38, H5: 39,
    A6: 40, B6: 41, C6: 42, D6: 43, E6: 44, F6: 45, G6: 46, H6: 47,
    A7: 48, B7: 49, C7: 50, D7: 51, E7: 52, F7: 53, G7: 54, H7: 55,
    A8: 56, B8: 57, C8: 58, D8: 59, E8: 60, F8: 61, G8: 62, H8: 63
} as const;