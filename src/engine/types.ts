import {
    WHITE,
    CASTLE_WHITE_KINGSIDE,
    CASTLE_WHITE_QUEENSIDE,
    CASTLE_BLACK_KINGSIDE,
    CASTLE_BLACK_QUEENSIDE,
    SQUARES
} from './constants';

export interface GameState {
    sideToMove: 0 | 1; // WHITE or BLACK
    castlingRights: number;
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

/**
 * Creates a new GameState object for the start of a game.
 */
export function createInitialGameState(): GameState {
    return {
        sideToMove: WHITE,
        castlingRights: CASTLE_WHITE_KINGSIDE | CASTLE_WHITE_QUEENSIDE | CASTLE_BLACK_KINGSIDE | CASTLE_BLACK_QUEENSIDE,
        enPassantSquare: -1,
        halfmoveClock: 0,
        fullmoveNumber: 1,
        kingSquare: [SQUARES.E1, SQUARES.E8]
    };
}