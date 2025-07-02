// Example usage in another file, e.g., src/main.ts

import { Game } from './engine/Game';
import { drawBoardTerminal } from './ui/draw';
// Create a new game instance
const game = new Game();

// You can access state directly (though you should usually use methods)
console.log("Side to move:", game.gameState.sideToMove);
console.log("Board:", game.board);
drawBoardTerminal(game.board);

// Generate all legal moves for the current position
const legalMoves = game.generateMoves();
console.log("Found legal moves:", legalMoves);

if (legalMoves.length > 0) {
    // Make the first available legal move
    console.log("Making move:", legalMoves[0]);
    const moveHistory = game.makeMove(legalMoves[0]);

    console.log("New board state:", game.board);
    drawBoardTerminal(game.board);
    console.log("New side to move:", game.gameState.sideToMove);

    // Undo the move
    console.log("Undoing the last move...");
    game.undoMove(moveHistory);
    
    console.log("Board state after undo:", game.board);
    drawBoardTerminal(game.board);
    console.log("Side to move after undo:", game.gameState.sideToMove);
}

// You can easily reset the game
game.reset();
console.log("Game has been reset.");