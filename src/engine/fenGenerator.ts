import { CASTLE_BLACK_KINGSIDE, CASTLE_BLACK_QUEENSIDE, CASTLE_WHITE_KINGSIDE, CASTLE_WHITE_QUEENSIDE, WHITE } from "./constants";
import { Game } from "./Game";

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
        default: return "E";
    }
}

export function generateFen(game: Game) : string {
    const board = [...game.board];
    const castlingRights = game.gameState.castlingRights;
    const enPassantSquare = game.gameState.enPassantSquare;
    let returnString = '';
    for (let rank = 7; rank >= 0; rank--) {
        let count = 0;
        for (let file = 0; file < 8; file++) {
            const index = rank*8 + file;
            const pieceCode = board[index];
            if (pieceCode === 0) {
                count++;
            } else {
                if (count !== 0) {
                    returnString += count + pieceCodeToLetter(pieceCode);
                    count = 0;
                } else {
                    returnString += pieceCodeToLetter(pieceCode);
                }
            }
        }
        returnString += "/";
    }
    returnString = returnString.substring(0,returnString.length-1) + " ";
    returnString += game.gameState.sideToMove === WHITE ? "w " : "b ";
    if (castlingRights > 0) {
        if (castlingRights & CASTLE_WHITE_KINGSIDE) returnString += "K";
        if (castlingRights & CASTLE_WHITE_QUEENSIDE) returnString += "Q";
        if (castlingRights & CASTLE_BLACK_KINGSIDE) returnString += "k";
        if (castlingRights & CASTLE_BLACK_QUEENSIDE) returnString += "q";
        returnString += " ";

    } else {
        returnString += "- ";
    }

    returnString += enPassantSquare === -1 ? "- " : enPassantSquare;
    returnString += game.gameState.halfmoveClock + " " + game.gameState.fullmoveNumber;

    return returnString;
}