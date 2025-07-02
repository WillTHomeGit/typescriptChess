const WHITE_PAWN_UNICODE = "\u2659";
const WHITE_KNIGHT_UNICODE = "\u2658";
const WHITE_BISHOP_UNICODE = "\u2657";
const WHITE_ROOK_UNICODE = "\u2656";
const WHITE_QUEEN_UNICODE = "\u2655";
const WHITE_KING_UNICODE = "\u2654";

const BLACK_PAWN_UNICODE = "\u265F";
const BLACK_KNIGHT_UNICODE = "\u265E";
const BLACK_BISHOP_UNICODE = "\u265D";
const BLACK_ROOK_UNICODE = "\u265C";
const BLACK_QUEEN_UNICODE = "\u265B";
const BLACK_KING_UNICODE = "\u265A";

function numberToUnicode(pieceCode: number): string {
    switch (pieceCode) {
        case 0:
            return ' ';
        case 1:
            return WHITE_PAWN_UNICODE;
        case 2:
            return WHITE_KNIGHT_UNICODE;
        case 3:
            return WHITE_BISHOP_UNICODE;
        case 4:
            return WHITE_ROOK_UNICODE;
        case 5:
            return WHITE_QUEEN_UNICODE;
        case 6:
            return WHITE_KING_UNICODE;
        case 7:
            return BLACK_PAWN_UNICODE;
        case 8:
            return BLACK_KNIGHT_UNICODE;
        case 9:
            return BLACK_BISHOP_UNICODE;
        case 10: 
            return BLACK_ROOK_UNICODE;
        case 11:
            return BLACK_QUEEN_UNICODE;
        case 12:
            return BLACK_KING_UNICODE;
        default:
            return "E";
    }
}

export function drawBoardTerminal(board64: Uint8Array) {
    let returnString = '';
    for (let i = 8; i >= 0 ; i--) {
        if (i != 0) returnString += i;
        else {
            returnString += "   a  b  c  d  e  f  g  h";
            return returnString;
        }
        for (let j = 0; j < 8; j++) {
            if (i <= 2) {
                returnString += "  " + numberToUnicode(board64[(8-i)*8 + j]-2)
            } else {
                returnString += "  " + numberToUnicode(board64[(8-i)*8 + j]);
            }
        }
        returnString += "\n";
    }
}