import { CASTLE_WHITE_KINGSIDE, CASTLE_WHITE_QUEENSIDE, CASTLE_BLACK_KINGSIDE, CASTLE_BLACK_QUEENSIDE, WHITE, BLACK } from './constants';

export interface GameState {
    sideToMove: 0 | 1; // WHITE or BLACK
    castlingRights: number; // 4-bit mask: 1 = WK, 2 = WQ, 4 = BK, 8 = BQ
    enPassantSquare: number; // 0–63 or -1
    halfmoveClock: number;
    fullmoveNumber: number;
    kingSquare: [number, number]; // [whiteKing, blackKing]
}

export type Move = {
    from: number;
    to: number;
    promotion?: number;
    flag?: number;
}

export type MoveHistory = {
    move: Move;
    capturedPiece: number;
    prevEnPassant: number;
    prevCastlingRights: number;
    prevHalfmoveClock: number;
};


export function createInitialGameState(): GameState {
    return {
        sideToMove: WHITE, // White moves first
        castlingRights: CASTLE_WHITE_KINGSIDE | CASTLE_WHITE_QUEENSIDE | CASTLE_BLACK_KINGSIDE | CASTLE_BLACK_QUEENSIDE, // All castling rights available
        enPassantSquare: -1, // No en passant initially
        halfmoveClock: 0, // Starts at 0
        fullmoveNumber: 1, // Game starts at move 1
        kingSquare: [4, 60] // White king on e1 (square 4), black king on e8 (square 60)
    };
}