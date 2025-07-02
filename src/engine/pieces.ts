import {
    COLOR_MASK,
    PIECE_MASK
} from "./constants";

/**
 * Extracts the piece type (e.g., PAWN, KNIGHT) from a piece code.
 */
export function getPieceType(pieceCode: number): number {
    return pieceCode & PIECE_MASK;
}

/**
 * Extracts the color (WHITE or BLACK) from a piece code.
 */
export function getPieceColor(pieceCode: number): number {
    return (pieceCode & COLOR_MASK) >> 3;
}

/**
 * Creates a piece code from a piece type and a color.
 */
export function makePiece(type: number, color: number): number {
    return type | (color << 3);
}