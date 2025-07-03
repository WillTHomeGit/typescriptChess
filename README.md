# TypeScript Chess Engine

A powerful, dependency-free chess engine written entirely in TypeScript. This project provides a robust backend API designed to be the logic core for any web-based chess application, such as one built with Chessground.

## Key Features

-   **Complete Chess Logic:** Implements all standard chess rules, including castling, en passant, and pawn promotion.
-   **FEN Support:** Can load positions from and generate Forsyth-Edwards Notation (FEN) strings.
-   **State Management:** Full game state tracking, including move history, turn color, and game status.
-   **Move Generation:** Efficiently generates all legal moves for the current position.
-   **Game Over Detection:** Correctly identifies check, checkmate, stalemate, and the 50-move rule.
-   **Clean API:** A simple, powerful API designed for easy integration with any frontend UI.
-   **Undo Functionality:** Built-in support for undoing the last move.

## Technology Stack

-   **TypeScript:** Provides type safety and modern JavaScript features.
-   **No Runtime Dependencies:** The core engine logic is self-contained and requires no external packages to run.
-   **Node.js / npm:** Used for development, building, and running tests.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need [Node.js](https://nodejs.org/) (which includes npm) installed on your system.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/WillTHomeGit/typescriptChess.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd typescriptChess
    ```
3.  **Install development dependencies:**
    ```sh
    npm install
    ```
4.  **Build the project:**
    This will compile the TypeScript code into JavaScript in the `dist` folder.
    ```sh
    npm run build
    ```

## Usage (API Overview)

The engine is designed to be used as a module. All interactions happen through the singleton `engine` object.

Here is a basic example of how to use the API:

```typescript
import { engine } from './dist/engine'; // Import from the compiled output

// Start a new game
let gameState = engine.startNewGame();
console.log("Starting FEN:", gameState.fen);
// > Starting FEN: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1

// Make a move
gameState = engine.makeMove('e2', 'e4');

if (gameState) {
  console.log("Side to move:", gameState.turn);
  // > Side to move: black
  console.log("New FEN:", gameState.fen);
  // > New FEN: rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1
}

// Try an illegal move
const illegalState = engine.makeMove('e1', 'e2');
console.log("Illegal move result:", illegalState);
// > Illegal move result: null```

## Running Tests

To run the test suite for the project, use the following command:

```sh
npm test

Project Structure

The codebase is organized to separate the core engine logic from the UI or other consumers.

src/engine/: Contains all the core chess logic, move generation, board representation, and the public-facing API facade (index.ts).

src/ui/: Contains a simple terminal-based UI for debugging and demonstration purposes.

docs/: Contains detailed documentation for developers.

Documentation

For a comprehensive guide on how to integrate this engine with a frontend UI like Chessground, please see the UI Integration Guide.

License

This project is licensed under the MIT License - see the LICENSE file for details.
