type Square = 'X' | 'O' | null;

interface WinnerResult {
  winner: 'X' | 'O';
  winningCombination: number[];
}

/**
 * Calculates the winner of a Tic-Tac-Toe game.
 * @param squares An array representing the game board.
 * @returns The winner and winning combination if there's a winner, null otherwise.
 */
export function calculateWinner(squares: Square[]): WinnerResult | null {
  const lines: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { 
        winner: squares[a] as 'X' | 'O', 
        winningCombination: [a, b, c] 
      };
    }
  }

  return null;
}

/**
 * Checks if the game is a draw (all squares filled with no winner).
 * @param squares An array representing the game board.
 * @returns True if the game is a draw, false otherwise.
 */
export function isDraw(squares: Square[]): boolean {
  return squares.every(square => square !== null) && !calculateWinner(squares);
}
