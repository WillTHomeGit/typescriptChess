import { EMPTY } from "./constants";

export interface PieceList {
    /** pieces[pieceCode] = array of squares */
    pieces: number[][];
    /** count[pieceCode] = number of pieces of that type */
    count: number[];
}

/**
 * Creates an empty PieceList object.
 */
export function createPieceList(): PieceList {
    return {
        pieces: Array.from({ length: 15 }, () => []),
        count: new Array(15).fill(0)
    };
}

/**
 * Populates a PieceList based on the state of a board.
 * @param pieceList The PieceList to populate.
 * @param board The board to scan for pieces.
 */
export function initializePieceListFromBoard(pieceList: PieceList, board: Uint8Array): void {
    // Clear existing lists
    for (let i = 0; i < 15; i++) {
        pieceList.pieces[i] = [];
        pieceList.count[i] = 0;
    }

    // Scan board and populate
    for (let square = 0; square < 64; square++) {
        const piece = board[square];
        if (piece !== EMPTY) {
            addPiece(pieceList, square, piece);
        }
    }
}

/**
 * Adds a piece to the piece list.
 */
export function addPiece(pieceList: PieceList, square: number, pieceCode: number): void {
    pieceList.pieces[pieceCode].push(square);
    pieceList.count[pieceCode]++;
}

/**
 * Removes a piece from the piece list using a fast swap-and-pop.
 */
export function removePiece(pieceList: PieceList, square: number, pieceCode: number): void {
    const pieces = pieceList.pieces[pieceCode];
    const index = pieces.indexOf(square);

    if (index !== -1) {
        // Swap with the last element and pop for O(1) removal
        pieces[index] = pieces[pieces.length - 1];
        pieces.pop();
        pieceList.count[pieceCode]--;
    }
}

/**
 * Updates the square of a piece that has moved.
 */
export function movePiece(pieceList: PieceList, fromSquare: number, toSquare: number, pieceCode: number): void {
    const pieces = pieceList.pieces[pieceCode];
    const index = pieces.indexOf(fromSquare);

    if (index !== -1) {
        pieces[index] = toSquare;
    }
}