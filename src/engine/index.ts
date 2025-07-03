/**
 * @file This file serves as the public-facing "front door" to the entire chess engine.
 * Its primary purpose is to provide a clean, simple, and stable API for the UI to interact with.
 * It uses the "Facade" design pattern to hide the complex internal workings of the chess engine
 * (like the `Game` class) and exposes only what the UI needs.
 *
 * The UI developer should only ever need to import the `engine` object from this file.
 */

import { Game } from './Game';
import { ChessEngineAPI, UIGameState } from './api';
import { squareToIndex } from './utils';
import { QUEEN, ROOK, BISHOP, KNIGHT } from './constants';
import { createUIGameState } from './stateTranslator';

/**
 * A lookup map to convert a single-character promotion piece (used by UIs like chess.js or chessground)
 * into the internal numeric constant that our engine understands.
 * This prevents the UI from needing to know about our internal engine constants.
 * It's case-insensitive by design in the `makeMove` function.
 */
const promotionCharToPieceType: { [key: string]: number } = {
    'q': QUEEN,
    'r': ROOK,
    'b': BISHOP,
    'n': KNIGHT,
};

/**
 * @class EngineService
 * @implements {ChessEngineAPI}
 *
 * This class implements the formal API contract defined in `api.ts`. It holds the single,
 * private instance of the core `Game` class and orchestrates calls to it based on UI requests.
 * Its methods are designed to be simple and directly map to user actions.
 */
class EngineService implements ChessEngineAPI {
    /**
     * The private instance of the core engine logic. All chess-related operations
     * are delegated to this object. It is "hidden" from the rest of the application.
     */
    private game: Game;

    constructor() {
        this.game = new Game();
    }

    /**
     * Handles the "New Game" action from the UI.
     * It resets the internal game state and returns the fresh, initial UI state.
     * @returns {UIGameState} The state of a new chess game.
     */
    public startNewGame(): UIGameState {
        this.game.reset();
        // After resetting, delegate to the translator to create the UI state object.
        return createUIGameState(this.game);
    }

    /**
     * Handles a user's move attempt from the UI.
     * It translates algebraic notation to internal indices, validates the move's legality
     * by asking the core engine, executes the move if legal, and returns the updated state.
     *
     * @param {string} from - The starting square in algebraic notation (e.g., 'e2').
     * @param {string} to - The destination square in algebraic notation (e.g., 'e4').
     * @param {string} [promotion='q'] - An optional character for the promotion piece (q, r, b, n).
     * @returns {UIGameState | null} The new game state if the move was successful, or `null` if illegal.
     */
    public makeMove(from: string, to: string, promotion: string = 'q'): UIGameState | null {
        // 1. Translate UI-friendly data into a format the core engine understands.
        const fromIndex = squareToIndex(from);
        const toIndex = squareToIndex(to);
        const promotionType = promotionCharToPieceType[promotion.toLowerCase()];

        // 2. Delegate the complex task of finding the move to the `Game` class.
        const move = this.game.findMove(fromIndex, toIndex, promotionType);

        // 3. Process the result.
        if (move) {
            // If a valid move was found, execute it on the internal game instance.
            this.game.makeMove(move);
            // Return the newly updated state for the UI to render.
            return createUIGameState(this.game);
        }

        // If no move was found, it was illegal. Signal this to the UI by returning null.
        return null;
    }

    /**
     * Handles the "Undo" action from the UI.
     * It reverts the last move made in the game and returns the updated UI state.
     * If no moves have been made, it does nothing and returns the current state.
     * @returns {UIGameState} The game state after the undo operation.
     * @added
     */
    public undoMove(): UIGameState {
        // 1. Check if there is a move to undo.
        if (this.game.moveHistory.length > 0) {
            // 2. Get the last move's history object to pass to the core undo function.
            // Your undoMove function in Game.ts requires the history object.
            const lastMoveHistory = this.game.moveHistory[this.game.moveHistory.length - 1];

            // 3. Delegate the complex task of undoing the move to the `Game` class.
            this.game.undoMove(lastMoveHistory);
        }

        // 4. Return the newly updated (or unchanged) state for the UI to render.
        return createUIGameState(this.game);
    }

    /**
     * Retrieves the complete, current state of the game in a UI-friendly format.
     * @returns {UIGameState} The current game state, ready for the UI to consume.
     */
    public getGameState(): UIGameState {
        // This method simply delegates the complex task of state translation
        // to our dedicated translator function. This keeps the API layer clean and focused.
        return createUIGameState(this.game);
    }
}

/**
 * The singleton instance of the EngineService.
 * The entire application will use this single object to interact with the chess engine,
 * ensuring there is one and only one source of truth for the game state.
 *
 * @example
 * // In a UI file:
 * import { engine } from './engine';
 *
 * const currentState = engine.getGameState();
 * const newGame = engine.startNewGame();
 */
export const engine = new EngineService();