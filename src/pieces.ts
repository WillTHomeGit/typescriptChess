import { COLOR_MASK, PIECE_MASK } from "./constants";

export function getPieceType ( pieceCode: number ): number {
    return pieceCode & PIECE_MASK;
}

export function getPieceColor ( pieceCode: number ): number {
    return (pieceCode & COLOR_MASK) >> 3;
}

export function isWhite( pieceCode: number ): boolean {
    return (pieceCode & COLOR_MASK) === 0;
}

export function isBlack( pieceCode: number ): boolean {
    return (pieceCode & COLOR_MASK) !== 0;
}

export function makePiece(type: number, color: number): number {
    return type | (color << 3)
}