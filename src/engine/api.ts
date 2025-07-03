/**
 * This interface describes the complete state of the chess game at any point.
 * Your engine module will produce objects that conform to this shape.
 */
export interface UIGameState {
  fen: string;
  turn: 'white' | 'black';
  /**
   * A map of all legal moves, compatible with Chessground.
   * The key is the starting square (e.g., 'e2') and the value is an array
   * of possible destination squares (e.g., ['e3', 'e4']).
   */
  dests: Map<string, string[]>;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw50Move: boolean;
  isGameOver: boolean;
  lastMove?: { from: string; to: string };

  /**
   * A list of all moves made in the game, in algebraic notation.
   * @added
   */
  history: { from: string, to: string, promotion?: string }[];

  /**
   * A map of piece types to the number of pieces captured for each color.
   * @added
   */
  capturedPieces: {
    white: { p: number, n: number, b: number, r: number, q: number },
    black: { p: number, n: number, b: number, r: number, q: number }
  };
}

/**
 * This interface defines the functions your engine module will expose.
 * The UI developer will only interact with your code through this API.
 */
export interface ChessEngineAPI {
  /** Returns the current state of the game for the UI. */
  getGameState(): UIGameState;

  /** 
   * Attempts to make a move using algebraic notation.
   * If the move is legal, it updates the internal state and returns the new UIGameState.
   * If the move is illegal, it returns null.
   */
  makeMove(from: string, to: string, promotion?: string): UIGameState | null;

  /** Starts a new game and returns the initial UIGameState. */
  startNewGame(): UIGameState;

  /**
   * Undoes the last move and returns the new UIGameState.
   * If there are no moves to undo, it returns the current state without changes.
   * @added
   */
  undoMove(): UIGameState;
}