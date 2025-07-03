import { Chess } from 'chess.js';
import { Game } from '../src/engine/Game';
import { createUIGameState } from '../src/engine/stateTranslator';
import { generateFen } from '../src/engine/fenGenerator';
import { squareToIndex } from '../src/engine/utils';
import { Move } from '../src/engine/types';

/**
 * A helper function to find and execute a move in the Game class using
 * algebraic notation, simplifying the test logic.
 * Returns true if the move was legal and made, false otherwise.
 */
function makeMove(game: Game, from: string, to: string, promotion?: string): boolean {
    const fromIndex = squareToIndex(from);
    const toIndex = squareToIndex(to);

    // This is the key difference from the UI: findMove needs the internal piece type for promotion
    const promotionType = promotion ? { 'q': 5, 'r': 4, 'b': 3, 'n': 2 }[promotion] : undefined;
    
    const move = game.findMove(fromIndex, toIndex, promotionType);

    if (move) {
        game.makeMove(move);
        return true;
    }
    return false;
}

describe('Chess Engine - Extended Rule Tests', () => {

    describe('En Passant Logic', () => {
        it('should correctly execute an en passant capture', () => {
            const game = new Game();
            const fen = 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
            game.loadFen(fen); // Position after 1. e4 d5

            // Make the move that enables en passant
            makeMove(game, 'e4', 'e5');
            
            // Black now plays c5, setting up the en passant opportunity for white's d-pawn
            const chessJs = new Chess(generateFen(game));
            makeMove(game, 'c7', 'c5');
            chessJs.move({ from: 'c7', to: 'c5' });

            // White captures d5 en passant
            makeMove(game, 'd2', 'd4');
            chessJs.move({ from: 'd2', to: 'd4' });

            makeMove(game, 'c5', 'c4');
            chessJs.move({ from: 'c5', to: 'c4' });

            // Now, white d-pawn captures black c-pawn en passant
            const epMoveFound = makeMove(game, 'd4', 'c5');
            expect(epMoveFound).toBe(true);

            // Compare FEN after capture
            chessJs.move({ from: 'd4', to: 'c5' });
            expect(generateFen(game)).toEqual(chessJs.fen());
        });

        it('should not allow en passant if the opportunity has passed', () => {
            const game = new Game();
            game.loadFen('rnbqkbnr/ppp1pppp/8/8/3pP3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
            
            // A different move is made, forfeiting the en passant right
            makeMove(game, 'a2', 'a3');
            
            // Try to make the en passant move (e4xd3) - it should fail
            const legalMoves = game.generateMoves();
            const epMove = legalMoves.find(m => m.from === squareToIndex('e4') && m.to === squareToIndex('d3'));
            
            expect(epMove).toBeUndefined();
        });
    });

    describe('Pawn Promotion', () => {
        it('should generate all 4 promotion moves (quiet)', () => {
            const game = new Game();
            game.loadFen('8/P7/8/8/8/8/K7/k7 w - - 0 1');
            
            const legalMoves = game.generateMoves();
            const promotionMoves = legalMoves.filter(m => m.from === squareToIndex('a7') && m.to === squareToIndex('a8'));
            
            expect(promotionMoves).toHaveLength(4);
            // Check that it generates one for each piece type
            expect(promotionMoves.some(m => m.promotion === 5)).toBe(true); // Queen
            expect(promotionMoves.some(m => m.promotion === 4)).toBe(true); // Rook
            expect(promotionMoves.some(m => m.promotion === 3)).toBe(true); // Bishop
            expect(promotionMoves.some(m => m.promotion === 2)).toBe(true); // Knight
        });

        it('should correctly execute a promotion with capture', () => {
            const game = new Game();
            game.loadFen('r7/1P6/8/8/8/8/K7/k7 w - - 0 1');
            
            const chessJs = new Chess('r7/1P6/8/8/8/8/K7/k7 w - - 0 1');
            
            const moveMade = makeMove(game, 'b7', 'a8', 'q');
            expect(moveMade).toBe(true);

            chessJs.move({ from: 'b7', to: 'a8', promotion: 'q' });

            expect(generateFen(game)).toEqual(chessJs.fen());
        });
    });

    describe('Castling Rights and Rules', () => {
        it('should NOT allow castling out of check', () => {
            const game = new Game();
            // Black bishop on a6 puts the white king in check
            game.loadFen('r3k2r/p1ppqpb1/b3pnp1/3PN3/1p2P3/2N2Q2/PPPBBPPP/R3K2R w KQkq - 2 2');
            
            const legalMoves = game.generateMoves();
            const castlingMove = legalMoves.find(m => m.flag && (m.flag & (1<<3) || m.flag & (1<<4)));

            expect(castlingMove).toBeUndefined();
        });

        it('should NOT allow castling through an attacked square', () => {
            const game = new Game();
            // Black rook on f7 attacks f1, blocking white kingside castling
            game.loadFen('r3k2r/p1ppqpr1/bn2pnp1/3PN3/1p2P3/2N2Q2/PPPBBPPP/R3K2R w KQkq - 0 1');
            
            const legalMoves = game.generateMoves();
            const kingsideCastle = legalMoves.find(m => m.to === squareToIndex('g1'));
            
            expect(kingsideCastle).toBeUndefined();
        });
        
        it('should lose castling rights permanently after a king move', () => {
            const game = new Game();
            game.reset();

            const chessJs = new Chess();

            makeMove(game, 'e1', 'f1');
            chessJs.move({ from: 'e1', to: 'f1' });
            
            makeMove(game, 'e8', 'f8');
            chessJs.move({ from: 'e8', to: 'f8' });

            makeMove(game, 'f1', 'e1');
            chessJs.move({ from: 'f1', to: 'e1' });

            // Now that the king is back, check if castling rights are gone
            const fenParts = generateFen(game).split(' ');
            expect(fenParts[2]).not.toContain('K');
            expect(fenParts[2]).not.toContain('Q');
        });

        it('should lose kingside castling right after h-rook moves', () => {
            const game = new Game();
            game.reset();
            
            makeMove(game, 'h1', 'h2');
            makeMove(game, 'a7', 'a6'); // Dummy move for black
            makeMove(game, 'h2', 'h1');
            
            const fenParts = generateFen(game).split(' ');
            expect(fenParts[2]).not.toContain('K'); // Kingside right is gone
            expect(fenParts[2]).toContain('Q');      // Queenside right remains
        });
    });

    describe('Game Over Conditions', () => {
        it('should correctly identify stalemate', () => {
            const game = new Game();
            // A classic stalemate position
            game.loadFen('8/8/8/8/8/5k2/8/5K1q w - - 3 50');

            const uiState = createUIGameState(game);
            
            expect(uiState.isGameOver).toBe(true);
            expect(uiState.isCheck).toBe(false); // It's a stalemate, not checkmate

            const chessJs = new Chess('8/8/8/8/8/5k2/8/5K1q w - - 3 50');
            expect(chessJs.isStalemate()).toBe(true);
        });

        it('should end the game by the 50-move rule', () => {
            const game = new Game();
            // Set up a position where the halfmove clock is at 99 (so the next move triggers the rule)
            // FEN format: <board> <turn> <castling> <en passant> <halfmove> <fullmove>
            const fen = '8/5k2/8/8/8/8/5K2/8 w - - 99 1';
            game.loadFen(fen);

            // Make a move that doesn't reset the clock
            makeMove(game, 'f2', 'e2');
            
            const uiState = createUIGameState(game);
            const fenParts = uiState.fen.split(' ');

            expect(fenParts[4]).toBe('100'); // Halfmove clock should now be 100
            expect(uiState.isGameOver).toBe(true); // Game should be over

            const chessJs = new Chess(fen);
            chessJs.move({ from: 'f2', to: 'e2'});
            expect(chessJs.isDraw()).toBe(true);
        });
    });
});