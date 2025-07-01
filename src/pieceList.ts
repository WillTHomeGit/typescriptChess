import { getPiece } from './board';

export interface PieceList {
  pieces: number[][]; // pieces[pieceCode] = array of squares
  count: number[];    // count[pieceCode] = number of pieces of that type
}

export function createPieceList(): PieceList {
  return {
    pieces: new Array(15).fill(null).map(() => []), // 0-14 to cover all piece codes
    count: new Array(15).fill(0)
  };
}

// Global piecelist instance
export let pieceList: PieceList = createPieceList();

export function addPiece(square: number, pieceCode: number): void {
  if (pieceCode === 0) return; // Don't add empty squares
  
  pieceList.pieces[pieceCode].push(square);
  pieceList.count[pieceCode]++;
}

export function removePiece(square: number, pieceCode: number): void {
  if (pieceCode === 0) return;
  
  const pieces = pieceList.pieces[pieceCode];
  const index = pieces.indexOf(square);
  
  if (index !== -1) {
    // Swap with last element and pop (O(1) removal)
    pieces[index] = pieces[pieces.length - 1];
    pieces.pop();
    pieceList.count[pieceCode]--;
  }
}

export function movePiece(fromSquare: number, toSquare: number, pieceCode: number): void {
  const pieces = pieceList.pieces[pieceCode];
  const index = pieces.indexOf(fromSquare);
  
  if (index !== -1) {
    pieces[index] = toSquare;
  }
}

export function initializePieceListFromBoard(): void {
  // Clear existing lists
  pieceList = createPieceList();
  
  // Scan board64 and populate piece lists
  for (let square = 0; square < 64; square++) {
    const piece = getPiece(square);
    if (piece !== 0) {
      addPiece(square, piece);
    }
  }
}

export function resetPieceList(): void {
  pieceList = createPieceList();
}

// Helper function to get all pieces of a specific type and color
export function getPiecesOfType(pieceCode: number): number[] {
  return [...pieceList.pieces[pieceCode]]; // Return a copy
}

// Helper function to get piece count
export function getPieceCount(pieceCode: number): number {
  return pieceList.count[pieceCode];
}

// Add to src/piecelist.ts
export function debugPieceList(): void {
    console.log("Current piece list:");
    for (let pieceCode = 1; pieceCode < 15; pieceCode++) {
        if (pieceList.count[pieceCode] > 0) {
            console.log(`Piece code ${pieceCode}: squares [${pieceList.pieces[pieceCode].join(', ')}]`);
        }
    }
}