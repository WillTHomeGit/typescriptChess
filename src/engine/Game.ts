import {
    boardTemplate,
    mailbox64,
    mailbox120
} from './board';
import {
    createPieceList,
    initializePieceListFromBoard,
    addPiece as addPieceToList,
    removePiece as removePieceFromList,
    movePiece as movePieceInList,
    PieceList
} from './pieceList';
import {
    PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, WHITE, BLACK,
    EMPTY, CASTLE_WHITE_KINGSIDE, CASTLE_WHITE_QUEENSIDE,
    CASTLE_BLACK_KINGSIDE, CASTLE_BLACK_QUEENSIDE,
    MOVE_NORMAL, MOVE_CAPTURE, MOVE_PROMOTION, MOVE_ENPASSANT,
    MOVE_CASTLE_KINGSIDE, MOVE_CASTLE_QUEENSIDE,
    DIAGONAL_DIR_OFFSETS, ORTHOGONAL_DIR_OFFSETS, KNIGHT_DIR_OFFSETS,
    CARDINAL_DIR_OFFSETS, SQUARES
} from './constants';
import {
    getPieceType,
    getPieceColor,
    makePiece
} from './pieces';
import {
    GameState,
    Move,
    MoveHistory,
    createInitialGameState
} from './types';


export class Game {
    public board: Uint8Array;
    public pieceList: PieceList;
    public gameState: GameState;
    public moveHistory: MoveHistory[];

    constructor() {
        this.board = new Uint8Array(64);
        this.pieceList = createPieceList();
        this.gameState = createInitialGameState();
        this.moveHistory = [];
        this.reset();
    }

    /**
     * Resets the game to the standard starting position.
     */
    public reset(): void {
        this.board.set(boardTemplate);
        this.gameState = createInitialGameState();
        initializePieceListFromBoard(this.pieceList, this.board);
        this.moveHistory.length = 0;
    }

    /**
     * Returns the piece on a given square.
     */
    public getPiece(square: number): number {
        return this.board[square];
    }

    /**
     * Generates all legal moves for the current side to move.
     */
    public generateMoves(): Move[] {
        const pseudoLegalMoves = this._generatePseudoLegalMoves();
        const legalMoves: Move[] = [];

        for (const move of pseudoLegalMoves) {
            // Make the move on the board
            const history = this.makeMove(move);

            // After making the move, the turn switches. We need to check if the king
            // of the original side is now in check.
            const originalColor = this.gameState.sideToMove === WHITE ? BLACK : WHITE;
            const kingSquare = this.gameState.kingSquare[originalColor];
            
            // The move is legal if the king is NOT attacked by the new side to move.
            if (!this.isSquareAttacked(kingSquare, this.gameState.sideToMove)) {
                legalMoves.push(move);
            }

            // Undo the move to restore the board state for the next check
            this.undoMove(history);
        }
        
        return legalMoves;
    }
    
    /**
     * Applies a move to the board and updates the game state.
     * Does not check for legality.
     * @param move The move to make.
     * @returns A history object for undoing the move.
     */
    public makeMove(move: Move): MoveHistory {
        const piece = this.getPiece(move.from);
        const capturedPiece = this.getPiece(move.to);
        const currentColor = this.gameState.sideToMove;
        const pieceType = getPieceType(piece);
        const moveFlag = move.flag || MOVE_NORMAL;

        const history: MoveHistory = {
            move: move,
            capturedPiece: capturedPiece,
            prevEnPassant: this.gameState.enPassantSquare,
            prevCastlingRights: this.gameState.castlingRights,
            prevHalfmoveClock: this.gameState.halfmoveClock
        };

        // Handle captures, including the piece list update
        if (capturedPiece !== EMPTY) {
            this._removePiece(move.to, capturedPiece);
        }
        
        // Move the primary piece
        this._movePiece(move.from, move.to, piece);
        
        // Handle special move types
        if (moveFlag & MOVE_ENPASSANT) {
            const capturedPawnSquare = currentColor === WHITE ? move.to - 8 : move.to + 8;
            this._removePiece(capturedPawnSquare, this.getPiece(capturedPawnSquare));
        } else if (moveFlag & MOVE_CASTLE_KINGSIDE) {
            this._handleCastle(currentColor, true);
        } else if (moveFlag & MOVE_CASTLE_QUEENSIDE) {
            this._handleCastle(currentColor, false);
        }

        // Handle promotion
        if (moveFlag & MOVE_PROMOTION && move.promotion) {
            const promotedPiece = makePiece(move.promotion, currentColor);
            this._removePiece(move.to, piece); // Remove the pawn
            this._addPiece(move.to, promotedPiece); // Add the new piece
        }
        
        // Update game state
        this._updateKingSquare(pieceType, currentColor, move.to);
        this._updateCastlingRights(piece, move, capturedPiece);
        this._updateEnPassantSquare(pieceType, move);
        this._updateHalfmoveClock(pieceType, capturedPiece !== EMPTY);
        this._switchSides();

        this.moveHistory.push(history);
        return history;
    }
    
    /**
     * Reverts the last move made using a history object.
     * @param history The history object from the move to be undone.
     */
    public undoMove(history: MoveHistory): void {
        const { move, capturedPiece, prevEnPassant, prevCastlingRights, prevHalfmoveClock } = history;
        const moveFlag = move.flag || MOVE_NORMAL;
        
        // Revert game state first
        this._switchSides(); // This also decrements fullmove if needed
        this.gameState.enPassantSquare = prevEnPassant;
        this.gameState.castlingRights = prevCastlingRights;
        this.gameState.halfmoveClock = prevHalfmoveClock;

        const currentColor = this.gameState.sideToMove;
        let movedPiece = this.getPiece(move.to); // This could be a promoted piece

        // Handle special undo cases
        if (moveFlag & MOVE_PROMOTION) {
            // Replace promoted piece with a pawn
            this._removePiece(move.to, movedPiece);
            this._addPiece(move.to, makePiece(PAWN, currentColor));
            movedPiece = this.getPiece(move.to);
        } else if (moveFlag & MOVE_CASTLE_KINGSIDE) {
            this._undoCastle(currentColor, true);
        } else if (moveFlag & MOVE_CASTLE_QUEENSIDE) {
            this._undoCastle(currentColor, false);
        } else if (moveFlag & MOVE_ENPASSANT) {
            // Restore the captured pawn
            const capturedPawnSquare = currentColor === WHITE ? move.to - 8 : move.to + 8;
            const enemyColor = currentColor === WHITE ? BLACK : WHITE;
            this._addPiece(capturedPawnSquare, makePiece(PAWN, enemyColor));
        }

        // Move the piece back
        this._movePiece(move.to, move.from, movedPiece);
        
        // Restore captured piece (if it wasn't an en passant)
        if (capturedPiece !== EMPTY && !(moveFlag & MOVE_ENPASSANT)) {
            this._addPiece(move.to, capturedPiece);
        }
        
        // Restore king square
        if (getPieceType(movedPiece) === KING) {
            this.gameState.kingSquare[currentColor] = move.from;
        }

        this.moveHistory.pop();
    }
    
    /**
     * Checks if a given square is attacked by the specified color.
     * @param square The 64-based square index to check.
     * @param attackingColor The color of the pieces that might be attacking.
     */
    public isSquareAttacked(square: number, attackingColor: 0 | 1): boolean {
        const square120 = mailbox64[square];
        
        // Pawns
        const pawnDir = attackingColor === WHITE ? 10 : -10;
        const enemyPawn = makePiece(PAWN, attackingColor);
        if (this.getPiece(mailbox120[square120 - pawnDir - 1]) === enemyPawn) return true;
        if (this.getPiece(mailbox120[square120 - pawnDir + 1]) === enemyPawn) return true;

        // Knights
        const enemyKnight = makePiece(KNIGHT, attackingColor);
        for (const offset of KNIGHT_DIR_OFFSETS) {
            if (this.getPiece(mailbox120[square120 + offset]) === enemyKnight) return true;
        }

        // Sliding pieces (and King)
        const enemyBishop = makePiece(BISHOP, attackingColor);
        const enemyRook = makePiece(ROOK, attackingColor);
        const enemyQueen = makePiece(QUEEN, attackingColor);
        const enemyKing = makePiece(KING, attackingColor);

        for (const dir of CARDINAL_DIR_OFFSETS) {
            let pos120 = square120 + dir;
            let pos64 = mailbox120[pos120];

            // King check (one step away)
            if (pos64 !== -1 && this.getPiece(pos64) === enemyKing) return true;

            const isDiagonal = Math.abs(dir) === 9 || Math.abs(dir) === 11;
            
            while (pos64 !== -1) {
                const piece = this.getPiece(pos64);
                if (piece !== EMPTY) {
                    if (isDiagonal) {
                        if (piece === enemyBishop || piece === enemyQueen) return true;
                    } else {
                        if (piece === enemyRook || piece === enemyQueen) return true;
                    }
                    break; // Piece blocks further attacks on this ray
                }
                pos120 += dir;
                pos64 = mailbox120[pos120];
            }
        }
        
        return false;
    }

    /**
     * Finds a specific legal move object based on from/to squares and an optional promotion type.
     * This is more efficient than the API layer searching through all moves.
     * @param from The 64-based starting square index.
     * @param to The 64-based destination square index.
     * @param promotionType The type of piece to promote to (e.g., QUEEN).
     * @returns The corresponding Move object if it's legal, otherwise undefined.
     */
    public findMove(from: number, to: number, promotionType?: number): Move | undefined {
        const legalMoves = this.generateMoves();
        
        for (const move of legalMoves) {
            if (move.from === from && move.to === to) {
                // If the move is a promotion, we must match the promotion type
                if (move.flag && (move.flag & MOVE_PROMOTION)) {
                    if (move.promotion === promotionType) {
                        return move;
                    }
                    // Continue searching if this isn't the right promotion
                } else {
                    // It's a normal move, so this is the one.
                    return move;
                }
            }
        }

        return undefined; // No legal move found
    }

    // ===================================================================
    // PRIVATE HELPER METHODS
    // ===================================================================

    // --- Piece & Board Manipulation ---

    private _addPiece(square: number, piece: number): void {
        this.board[square] = piece;
        addPieceToList(this.pieceList, square, piece);
    }
    
    private _removePiece(square: number, piece: number): void {
        this.board[square] = EMPTY;
        removePieceFromList(this.pieceList, square, piece);
    }

    private _movePiece(from: number, to: number, piece: number): void {
        this.board[from] = EMPTY;
        this.board[to] = piece;
        movePieceInList(this.pieceList, from, to, piece);
    }

    // --- Game State Updates ---

    private _switchSides(): void {
        if (this.gameState.sideToMove === BLACK) {
            this.gameState.fullmoveNumber++;
        }
        this.gameState.sideToMove = this.gameState.sideToMove === WHITE ? BLACK : WHITE;
    }

    private _updateKingSquare(pieceType: number, color: number, to: number): void {
        if (pieceType === KING) {
            this.gameState.kingSquare[color] = to;
        }
    }

    private _updateHalfmoveClock(pieceType: number, isCapture: boolean): void {
        if (pieceType === PAWN || isCapture) {
            this.gameState.halfmoveClock = 0;
        } else {
            this.gameState.halfmoveClock++;
        }
    }

    private _updateEnPassantSquare(pieceType: number, move: Move): void {
        // Clear previous en passant square
        this.gameState.enPassantSquare = -1;
        
        if (pieceType === PAWN && Math.abs(move.to - move.from) === 16) {
            this.gameState.enPassantSquare = move.from + (move.to - move.from) / 2;
        }
    }
    
    private _updateCastlingRights(piece: number, move: Move, capturedPiece: number): void {
        const pieceType = getPieceType(piece);
        const color = getPieceColor(piece);

        if (pieceType === KING) {
            if (color === WHITE) {
                this.gameState.castlingRights &= ~(CASTLE_WHITE_KINGSIDE | CASTLE_WHITE_QUEENSIDE);
            } else {
                this.gameState.castlingRights &= ~(CASTLE_BLACK_KINGSIDE | CASTLE_BLACK_QUEENSIDE);
            }
        } else if (pieceType === ROOK) {
            if (move.from === SQUARES.A1) this.gameState.castlingRights &= ~CASTLE_WHITE_QUEENSIDE;
            else if (move.from === SQUARES.H1) this.gameState.castlingRights &= ~CASTLE_WHITE_KINGSIDE;
            else if (move.from === SQUARES.A8) this.gameState.castlingRights &= ~CASTLE_BLACK_QUEENSIDE;
            else if (move.from === SQUARES.H8) this.gameState.castlingRights &= ~CASTLE_BLACK_KINGSIDE;
        }

        if (capturedPiece !== EMPTY && getPieceType(capturedPiece) === ROOK) {
            if (move.to === SQUARES.A1) this.gameState.castlingRights &= ~CASTLE_WHITE_QUEENSIDE;
            else if (move.to === SQUARES.H1) this.gameState.castlingRights &= ~CASTLE_WHITE_KINGSIDE;
            else if (move.to === SQUARES.A8) this.gameState.castlingRights &= ~CASTLE_BLACK_QUEENSIDE;
            else if (move.to === SQUARES.H8) this.gameState.castlingRights &= ~CASTLE_BLACK_KINGSIDE;
        }
    }
    
    // --- Castle Logic ---

    private _handleCastle(color: number, isKingside: boolean): void {
        const isWhite = color === WHITE;
        const rookStart = isKingside ? (isWhite ? SQUARES.H1 : SQUARES.H8) : (isWhite ? SQUARES.A1 : SQUARES.A8);
        const rookEnd = isKingside ? (isWhite ? SQUARES.F1 : SQUARES.F8) : (isWhite ? SQUARES.D1 : SQUARES.D8);
        const rook = this.getPiece(rookStart);
        this._movePiece(rookStart, rookEnd, rook);
    }
    
    private _undoCastle(color: number, isKingside: boolean): void {
        const isWhite = color === WHITE;
        const rookStart = isKingside ? (isWhite ? SQUARES.H1 : SQUARES.H8) : (isWhite ? SQUARES.A1 : SQUARES.A8);
        const rookEnd = isKingside ? (isWhite ? SQUARES.F1 : SQUARES.F8) : (isWhite ? SQUARES.D1 : SQUARES.D8);
        const rook = this.getPiece(rookEnd);
        this._movePiece(rookEnd, rookStart, rook);
    }

    // --- Move Generation Logic ---

    private _generatePseudoLegalMoves(): Move[] {
        const moves: Move[] = [];
        const sideToMove = this.gameState.sideToMove;

        // Iterate over pieces using the piece list for efficiency
        for (let pieceCode = 1; pieceCode < 15; pieceCode++) {
            if (getPieceColor(pieceCode) !== sideToMove) continue;

            const pieceType = getPieceType(pieceCode);
            const squares = this.pieceList.pieces[pieceCode];
            
            for (const square of squares) {
                switch (pieceType) {
                    case PAWN:   moves.push(...this._generatePawnMoves(square, sideToMove)); break;
                    case KNIGHT: moves.push(...this._generateKnightMoves(square, sideToMove)); break;
                    case BISHOP: moves.push(...this._generateSlidingMoves(square, sideToMove, DIAGONAL_DIR_OFFSETS)); break;
                    case ROOK:   moves.push(...this._generateSlidingMoves(square, sideToMove, ORTHOGONAL_DIR_OFFSETS)); break;
                    case QUEEN:  moves.push(...this._generateSlidingMoves(square, sideToMove, CARDINAL_DIR_OFFSETS)); break;
                    case KING:   moves.push(...this._generateKingMoves(square, sideToMove)); break;
                }
            }
        }
        return moves;
    }
    
    private _generatePawnMoves(square: number, color: number): Move[] {
        const moves: Move[] = [];
        const from120 = mailbox64[square];
        
        // Determine direction based on color
        const direction = color === WHITE ? 10 : -10; // +10 for white (up), -10 for black (down)
        
        // Helper function to get rank from square (0-based)
        const getRank = (sq: number) => Math.floor(sq / 8);
        
        const currentRank = getRank(square);
        const startingRank = color === WHITE ? 1 : 6; // Rank 2 for white, rank 7 for black
        const promotionRank = color === WHITE ? 7 : 0; // Rank 8 for white, rank 1 for black
        
        // Forward moves
        const oneSquareForward120 = from120 + direction;
        const oneSquareForward64 = mailbox120[oneSquareForward120];
        
        if (oneSquareForward64 !== -1 && this.getPiece(oneSquareForward64) === EMPTY) {
            // Check if this is a promotion
            if (getRank(oneSquareForward64) === promotionRank) {
                // Add promotion moves for all possible pieces
                for (const promotionPiece of [QUEEN, ROOK, BISHOP, KNIGHT]) {
                    moves.push({
                        from: square,
                        to: oneSquareForward64,
                        flag: MOVE_PROMOTION,
                        promotion: promotionPiece
                    });
                }
            } else {
                moves.push({
                    from: square,
                    to: oneSquareForward64,
                    flag: MOVE_NORMAL
                });
                
                // Two squares forward from starting position
                if (currentRank === startingRank) {
                    const twoSquaresForward120 = from120 + (direction * 2);
                    const twoSquaresForward64 = mailbox120[twoSquaresForward120];
                    
                    if (twoSquaresForward64 !== -1 && this.getPiece(twoSquaresForward64) === EMPTY) {
                        moves.push({
                            from: square,
                            to: twoSquaresForward64,
                            flag: MOVE_NORMAL
                        });
                    }
                }
            }
        }
        
        // Diagonal captures
        for (const captureOffset of [direction - 1, direction + 1]) { // Left and right diagonals
            const captureSquare120 = from120 + captureOffset;
            const captureSquare64 = mailbox120[captureSquare120];
            
            if (captureSquare64 !== -1) {
                const targetPiece = this.getPiece(captureSquare64);
                
                // Regular capture
                if (targetPiece !== EMPTY && getPieceColor(targetPiece) !== color) {
                    // Check if this is a promotion
                    if (getRank(captureSquare64) === promotionRank) {
                        // Add promotion captures for all possible pieces
                        for (const promotionPiece of [QUEEN, ROOK, BISHOP, KNIGHT]) {
                            moves.push({
                                from: square,
                                to: captureSquare64,
                                flag: MOVE_PROMOTION | MOVE_CAPTURE,
                                promotion: promotionPiece
                            });
                        }
                    } else {
                        moves.push({
                            from: square,
                            to: captureSquare64,
                            flag: MOVE_CAPTURE
                        });
                    }
                }
                
                // En passant capture
                if (targetPiece === EMPTY && captureSquare64 === this.gameState.enPassantSquare) {
                    moves.push({
                        from: square,
                        to: captureSquare64,
                        flag: MOVE_ENPASSANT
                    });
                }
            }
        }
        
        return moves;
    }

    private _generateKnightMoves(square: number, color: number): Move[] {
        const moves: Move[] = [];
        const from120 = mailbox64[square];

        for (const offset of KNIGHT_DIR_OFFSETS) {
            const to120 = from120 + offset;
            const to64 = mailbox120[to120];

            if (to64 === -1) continue;

            const targetPiece = this.getPiece(to64);
            if (targetPiece !== EMPTY && getPieceColor(targetPiece) === color) continue;

            moves.push({
                from: square,
                to: to64,
                flag: targetPiece !== EMPTY ? MOVE_CAPTURE : MOVE_NORMAL
            });
        }
        return moves;
    }

    private _generateSlidingMoves(square: number, color: number, directions: readonly number[]): Move[] {
        const moves: Move[] = [];
        const from120 = mailbox64[square];

        for (const dir of directions) {
            let to120 = from120 + dir;
            let to64 = mailbox120[to120];

            while (to64 !== -1) {
                const targetPiece = this.getPiece(to64);
                if (targetPiece === EMPTY) {
                    moves.push({ from: square, to: to64, flag: MOVE_NORMAL });
                } else {
                    if (getPieceColor(targetPiece) !== color) {
                        moves.push({ from: square, to: to64, flag: MOVE_CAPTURE });
                    }
                    break; // Blocked
                }
                to120 += dir;
                to64 = mailbox120[to120];
            }
        }
        return moves;
    }

    private _generateKingMoves(square: number, color: number): Move[] {
        const moves: Move[] = [];
        const from120 = mailbox64[square];

        // Regular king moves (one square in any direction)
        for (const offset of CARDINAL_DIR_OFFSETS) {
            const to120 = from120 + offset;
            const to64 = mailbox120[to120];

            if (to64 === -1) continue;

            const targetPiece = this.getPiece(to64);
            if (targetPiece !== EMPTY && getPieceColor(targetPiece) === color) continue;

            moves.push({
                from: square,
                to: to64,
                flag: targetPiece !== EMPTY ? MOVE_CAPTURE : MOVE_NORMAL
            });
        }

        // Castling moves
        // Only consider castling if the king is not currently in check
        if (!this.isSquareAttacked(square, color === WHITE ? BLACK : WHITE)) {
            
            if (color === WHITE) {
                // White kingside castling (O-O)
                if ((this.gameState.castlingRights & CASTLE_WHITE_KINGSIDE) &&
                    this.getPiece(SQUARES.F1) === EMPTY &&
                    this.getPiece(SQUARES.G1) === EMPTY &&
                    !this.isSquareAttacked(SQUARES.F1, BLACK)) {
                    moves.push({
                        from: square,
                        to: SQUARES.G1,
                        flag: MOVE_CASTLE_KINGSIDE
                    });
                }
                
                // White queenside castling (O-O-O)
                if ((this.gameState.castlingRights & CASTLE_WHITE_QUEENSIDE) &&
                    this.getPiece(SQUARES.B1) === EMPTY &&
                    this.getPiece(SQUARES.C1) === EMPTY &&
                    this.getPiece(SQUARES.D1) === EMPTY &&
                    !this.isSquareAttacked(SQUARES.D1, BLACK)) {
                    moves.push({
                        from: square,
                        to: SQUARES.C1,
                        flag: MOVE_CASTLE_QUEENSIDE
                    });
                }
            } else {
                // Black kingside castling (O-O)
                if ((this.gameState.castlingRights & CASTLE_BLACK_KINGSIDE) &&
                    this.getPiece(SQUARES.F8) === EMPTY &&
                    this.getPiece(SQUARES.G8) === EMPTY &&
                    !this.isSquareAttacked(SQUARES.F8, WHITE)) {
                    moves.push({
                        from: square,
                        to: SQUARES.G8,
                        flag: MOVE_CASTLE_KINGSIDE
                    });
                }
                
                // Black queenside castling (O-O-O)
                if ((this.gameState.castlingRights & CASTLE_BLACK_QUEENSIDE) &&
                    this.getPiece(SQUARES.B8) === EMPTY &&
                    this.getPiece(SQUARES.C8) === EMPTY &&
                    this.getPiece(SQUARES.D8) === EMPTY &&
                    !this.isSquareAttacked(SQUARES.D8, WHITE)) {
                    moves.push({
                        from: square,
                        to: SQUARES.C8,
                        flag: MOVE_CASTLE_QUEENSIDE
                    });
                }
            }
        }

        return moves;
    }
}