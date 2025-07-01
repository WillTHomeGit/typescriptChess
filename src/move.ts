import { clearSquare, getPiece, setPiece } from './board';
import { removePiece, movePiece } from './pieceList';
import { Move } from './types';

export function makeMove(move: Move): void {
    const piece = getPiece(move.from);
    const capturedPiece = getPiece(move.to);
    
    // Handle capture
    if (capturedPiece !== 0) {
        removePiece(move.to, capturedPiece);
    }
    
    // Handle piece movement
    movePiece(move.from, move.to, piece);
    
    // Update the actual board
    setPiece(move.to, piece);
    clearSquare(move.from);
    
    // TODO: Handle special moves (castling, en passant, promotion)
    // TODO: Update game state (side to move, castling rights, etc.)
}