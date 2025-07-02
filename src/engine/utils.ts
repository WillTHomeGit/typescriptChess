/**
 * Converts a 0-63 square index to algebraic notation.
 * e.g., 0 -> 'a1', 63 -> 'h8'
 */
export function indexToSquare(index: number): string {
  const file = String.fromCharCode('a'.charCodeAt(0) + (index % 8));
  const rank = Math.floor(index / 8) + 1;
  return `${file}${rank}`;
}

/**
 * Converts an algebraic square notation to a 0-63 index.
 * e.g., 'a1' -> 0, 'h8' -> 63
 */
export function squareToIndex(square: string): number {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(square[1], 10) - 1;
  return rank * 8 + file;
}