import { EMPTY, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING } from "./constants";
import { WHITE } from "./constants";
import { board64, mailbox64, mailbox120 } from "./board";
import { getPieceColor, makePiece } from "./pieces";

export function isSquareAttacked(square: number): boolean {
    const square120 = mailbox64[square];
    const byColor = getPieceColor(square);
    const enemyPawn = makePiece(PAWN, byColor);
    const enemyKnight = makePiece(KNIGHT, byColor);
    const enemyBishop = makePiece(BISHOP, byColor);
    const enemyRook = makePiece(ROOK, byColor);
    const enemyQueen = makePiece(QUEEN, byColor);
    const enemyKing = makePiece(KING, byColor);
    
    // Check for pawn attacks (most common)
    const pawnDirection = byColor === WHITE ? 10 : -10;
    if (mailbox120[square120 + pawnDirection - 1] !== -1 && 
        board64[mailbox120[square120 + pawnDirection - 1]] === enemyPawn) return true;
    if (mailbox120[square120 + pawnDirection + 1] !== -1 && 
        board64[mailbox120[square120 + pawnDirection + 1]] === enemyPawn) return true;
    
    // Check diagonal sliding pieces first (bishops and queens)
    for (const dir of [-9, 9, -11, 11]) {
        let pos120 = square120 + dir;
        let pos64 = mailbox120[pos120];
        
        // Check for king on first square
        if (pos64 !== -1 && board64[pos64] === enemyKing) return true;
        
        while (pos64 !== -1) {
            const piece = board64[pos64];
            if (piece !== EMPTY) {
                if (piece === enemyBishop || piece === enemyQueen) return true;
                break;
            }
            pos120 += dir;
            pos64 = mailbox120[pos120];
        }
    }
    
    // Check orthogonal sliding pieces (rooks and queens)
    for (const dir of [-10, 10, -1, 1]) {
        let pos120 = square120 + dir;
        let pos64 = mailbox120[pos120];
        
        // Check for king on first square
        if (pos64 !== -1 && board64[pos64] === enemyKing) return true;
        
        while (pos64 !== -1) {
            const piece = board64[pos64];
            if (piece !== EMPTY) {
                if (piece === enemyRook || piece === enemyQueen) return true;
                break;
            }
            pos120 += dir;
            pos64 = mailbox120[pos120];
        }
    }
    
    // Check for knight attacks
    const knightOffsets = [21, 19, 12, 8, -21, -19, -12, -8];
    for (const offset of knightOffsets) {
        const pos64 = mailbox120[square120 + offset];
        if (pos64 !== -1 && board64[pos64] === enemyKnight) return true;
    }
    
    return false;
}