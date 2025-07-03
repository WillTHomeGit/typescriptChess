Of course. Here is the final, comprehensive guide. It is designed to be a complete, standalone document you can give directly to your frontend team. It includes the updated API, detailed integration steps, and a clear breakdown of their responsibilities.

---

### **Developer Guide: Integrating the Chess Engine with a Chessground UI**

**Version 3.0 (Final)**

This document provides everything you need to build a full-featured chess UI using our backend engine and the Chessground library.

#### **1. The API: Your Toolkit**

You will only interact with the backend through the `engine` object. This is your single point of entry. It provides all the data you need in a single, convenient package called the `UIGameState`.

**API Methods:**

| Method                                       | Description                                       |
| -------------------------------------------- | ------------------------------------------------- |
| `engine.startNewGame()`                      | Starts a new game.                                |
| `engine.getGameState()`                      | Gets the current state.                           |
| `engine.makeMove(from, to, promotion?)`      | Makes a move. Returns `null` if illegal.          |
| `engine.undoMove()`                          | Undoes the last move.                             |

**The `UIGameState` Object:**

Every API call returns this object. It is designed to give you everything you need to render the entire UI.

```typescript
interface UIGameState {
  // --- Core Board State ---
  fen: string;                      // For setting the board position
  turn: 'white' | 'black';         // For setting whose turn it is
  dests: Map<string, string[]>;     // For showing legal moves
  lastMove?: { from: string; to: string }; // For highlighting the last move
  isCheck: boolean;                 // For highlighting a king in check

  // --- Game Status ---
  isGameOver: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw50Move: boolean;

  // --- UI Feature Data ---
  history: { from: string, to: string, promotion?: string }[];
  capturedPieces: {
    white: { p: number, n: number, b: number, r: number, q: number },
    black: { p: number, n: number, b: number, r: number, q: number }
  };
}
```

---

#### **2. Integration Guide: Connecting the Engine to the UI**

This guide provides the logic patterns for connecting the engine. You will need to adapt these patterns to your specific frontend framework and component structure.

##### **Step 1: Setup & Initialization**
Set up your Chessground instance using the initial state from the engine.

```typescript
// Import necessary modules
import { Chessground } from 'chessground';
import { Api as ChessgroundApi } from 'chessground/api';
import { Key } from 'chessground/types';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import { engine } from './engine';
import { UIGameState } from './engine/api';

// --- In your main UI script or component ---
const boardElement = document.getElementById('chess-board');
const initialState = engine.getGameState();

const board: ChessgroundApi = Chessground(boardElement, {
  fen: initialState.fen,
  turnColor: initialState.turn,
  movable: {
    color: initialState.turn,
    dests: initialState.dests,
    free: false, // The user can only make legal moves
    events: {
      // Use the 'after' event for a responsive feel
      after: (from, to) => handleUserMove(from, to)
    }
  },
  highlight: {
    lastMove: true,
    check: true
  }
});

// Initial UI render
updateUi(initialState);
```

##### **Step 2: The Core Logic Loop**
All your button clicks and move events will follow this simple pattern:
1.  Call the appropriate `engine` method.
2.  Receive the new `UIGameState`.
3.  Pass that state to a single `updateUi` helper function.

```typescript
// --- Event Handlers ---

function handleUserMove(from: Key, to: Key) {
  // NOTE: Your pawn promotion logic must go here.
  // You need to detect if a move is a promotion and show a UI to ask the user
  // which piece they want before calling the engine.
  
  const newState = engine.makeMove(from, to);
  if (newState) {
    updateUi(newState);
  }
  // If newState is null, the move was illegal. Chessground handles snapping the piece back.
}

document.getElementById('new-game-btn').addEventListener('click', () => {
  const newState = engine.startNewGame();
  updateUi(newState);
});

document.getElementById('undo-btn').addEventListener('click', () => {
  const newState = engine.undoMove();
  updateUi(newState);
});
```

##### **Step 3: The `updateUi` Helper Function**
Create a central function that takes the `UIGameState` and updates all parts of your UI. This keeps your code organized and easy to maintain.

```typescript
/**
 * A central function to update the entire UI with a new state from our engine.
 */
function updateUi(state: UIGameState): void {
  // 1. Update the board itself
  board.set({
    fen: state.fen,
    turnColor: state.turn,
    movable: {
      color: state.turn,
      dests: state.dests
    },
    lastMove: state.lastMove ? [state.lastMove.from, state.lastMove.to] : undefined,
    check: state.isCheck
  });

  // 2. Update the move history list
  renderMoveHistory(state.history);

  // 3. Update the captured pieces display
  renderCapturedPieces(state.capturedPieces);

  // 4. Update the game status message
  renderGameStatus(state);
}
```
---
<br>

### **Frontend Team's Responsibilities (What You Still Need to Build)**

Our engine handles the chess *rules*. Your job is to build the user *experience*. The guide above provides the blueprint for connecting our systems, but you are responsible for building the house itself.

**Your Core Tasks:**

1.  **HTML Structure & CSS Styling:**
    *   Create the actual HTML for the board container, buttons, sidebars, and information panels.
    *   Write all the CSS to create a beautiful, responsive, and modern layout.

2.  **Framework Integration (React, Vue, Svelte, etc.):**
    *   Adapt the provided logic patterns into your chosen framework.
    *   This includes managing state (e.g., with `useState` or a store), handling component lifecycles (`useEffect`), and creating reusable UI components.

3.  **Implement the Pawn Promotion UI:**
    *   This is a crucial frontend-only task.
    *   Your code must detect when a user moves a pawn to the final rank.
    *   You must then prevent the `engine.makeMove` call and instead display a UI element (e.g., a modal dialog) asking the user to choose a promotion piece.
    *   Finally, you will call `engine.makeMove(from, to, userChoice)` with their selection.

4.  **Build UI Feature Components:**
    *   The guide provides simple, non-production examples of render functions. You need to build robust, well-styled components for these features.
    *   **Move History:** Create a scrollable list of moves.
    *   **Captured Pieces:** Design a clean display for pieces captured by each player.
    *   **Game Status:** Replace `alert()`s with a professional game-over modal or an elegant message display.

5.  **Implement Additional UX Features:**
    *   A "Flip Board" button.
    *   Player clocks/timers.
    *   A display showing whose turn it is.
    *   Visual feedback for illegal moves (beyond the default snap-back).
