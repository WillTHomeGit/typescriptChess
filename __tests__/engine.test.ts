// __tests__/engine.test.ts

import { Chess } from 'chess.js'; // FIX: Import the Chess class
import { Game } from '../src/engine/Game';
import { createUIGameState } from '../src/engine/stateTranslator'; // FIX: Import the state translator
import { generateFen } from '../src/engine/fenGenerator'; // FIX: Import the FEN generator
import { squareToIndex } from '../src/engine/utils'; // FIX: Import the square utility

// This helper function is correct and can remain as is.
function perft(game: Game, depth: number): number {
    if (depth === 0) return 1;

    const moves = game.generateMoves();
    let nodes = 0;

    if (depth === 1) return moves.length;

    for (const move of moves) {
        const history = game.makeMove(move);
        nodes += perft(game, depth - 1);
        game.undoMove(history);
    }
    return nodes;
}

describe('Chess Engine Tests', () => {

    it('should correctly load a FEN string and pass Perft test for a complex position', () => {
        const game = new Game();
        const fen = 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -';
        game.loadFen(fen);

        // NOTE: The Perft test part of your code was already correct!
        expect(perft(game, 1)).toBe(48);
        expect(perft(game, 2)).toBe(2039);
        // This last one is a great, tough test for your move generator.
        // It might be slow, which is expected.
        expect(perft(game, 3)).toBe(97862);
    });

    it('should produce a valid FEN string after a move', () => {
        const game = new Game();
        game.reset();

        // FIX: The Game class's makeMove takes a Move object, not strings.
        // We must find the move first.
        const fromIndex = squareToIndex('e2');
        const toIndex = squareToIndex('e4');
        const move = game.findMove(fromIndex, toIndex);

        // Ensure the move was found before making it
        expect(move).toBeDefined();
        if (!move) return; // Guard for TypeScript

        game.makeMove(move);

        const chess = new Chess();
        chess.move({ from: 'e2', to: 'e4' });

        // FIX: getGameState() is on the EngineService facade.
        // We use the generateFen utility directly with the Game object.
        const myFen = generateFen(game);
        const correctFen = chess.fen();

        const myFenParts = myFen.split(' ');
        const correctFenParts = correctFen.split(' ');

        expect(myFenParts[0]).toBe(correctFenParts[0]); // Board position
        expect(myFenParts[1]).toBe(correctFenParts[1]); // Active color
        expect(myFenParts[2]).toBe(correctFenParts[2]); // Castling rights
    });

    it('should correctly identify checkmate', () => {
        const game = new Game();
        const fen = 'rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3';
        
        // FIX: loadFen returns void. It modifies the game object in place.
        game.loadFen(fen); 

        // FIX: After loading, we create the UI state from the game object.
        const uiState = createUIGameState(game);

        const chess = new Chess(fen);

        expect(uiState.isGameOver).toBe(true);
        expect(uiState.isCheck).toBe(true);
        
        // Compare with chess.js
        expect(chess.isGameOver()).toBe(true);
        expect(chess.isCheckmate()).toBe(true);
    });
});