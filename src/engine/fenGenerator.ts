// src/engine/fenGenerator.ts

import { CASTLE_BLACK_KINGSIDE, CASTLE_BLACK_QUEENSIDE, CASTLE_WHITE_KINGSIDE, CASTLE_WHITE_QUEENSIDE, WHITE } from "./constants";
import { Game } from "./Game";
import { indexToSquare } from "./utils"; // Import the utility function

function pieceCodeToLetter(pieceCode: number) : string {
    switch (pieceCode) {
        case 1: return 'P';
        case 2: return 'N';
        case 3: return 'B';
        case 4: return 'R';
        case 5: return 'Q';
        case 6: return 'K';
        case 9: return 'p';
        case 10: return 'n';
        case 11: return 'b';
        case 12: return 'r';
        case 13: return 'q';
        case 14: return 'k';
        default: return ""; // Return empty string for empty piece
    }
}

export function generateFen(game: Game) : string {
    const board = game.board; // No need for a copy
    let piecePlacement = '';

    for (let rank = 7; rank >= 0; rank--) {
        let emptyCounter = 0;
        for (let file = 0; file < 8; file++) {
            const index = rank * 8 + file;
            const pieceCode = board[index];

            if (pieceCode === 0) {
                emptyCounter++;
            } else {
                if (emptyCounter > 0) {
                    piecePlacement += emptyCounter;
                }
                piecePlacement += pieceCodeToLetter(pieceCode);
                emptyCounter = 0;
            }
        }
        // FIX: After the file loop, append any remaining count for the rank
        if (emptyCounter > 0) {
            piecePlacement += emptyCounter;
        }

        // Add the rank separator, but not for the very last rank
        if (rank > 0) {
            piecePlacement += "/";
        }
    }

    const side = game.gameState.sideToMove === WHITE ? 'w' : 'b';

    const castlingRights = game.gameState.castlingRights;
    let castleStr = '';
    if (castlingRights & CASTLE_WHITE_KINGSIDE) castleStr += "K";
    if (castlingRights & CASTLE_WHITE_QUEENSIDE) castleStr += "Q";
    if (castlingRights & CASTLE_BLACK_KINGSIDE) castleStr += "k";
    if (castlingRights & CASTLE_BLACK_QUEENSIDE) castleStr += "q";
    if (castleStr === '') castleStr = '-';

    // FIX #2: The en passant square must be in algebraic notation, not an index
    const enPassant = game.gameState.enPassantSquare === -1 
        ? '-' 
        : indexToSquare(game.gameState.enPassantSquare);

    return [
        piecePlacement,
        side,
        castleStr,
        enPassant,
        game.gameState.halfmoveClock,
        game.gameState.fullmoveNumber
    ].join(' ');
}