import React from "react";

import Board from "@/components/Board";
import { calculateWinner } from "@/helpers";

const styles = {
    width: "200px",
    margin: "20px auto",
}

export default function Game(): React.ReactElement {
    const [board, setBoard] = React.useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = React.useState(true);
    const winner = calculateWinner(board);
    
    function handleClick(i: number) {
        const boardCopy = [...board];
        if (winner || boardCopy[i]) return;
        boardCopy[i] = xIsNext ? "X" : "O";
        setBoard(boardCopy);
        setXIsNext(!xIsNext);
    }

    // function jumpTo() {}

    function renderMoves() {
        return <button onClick={() => setBoard(Array(9).fill(null))}>Start Game</button>
    }

    return (
        <>
            <Board squares={board} onClick={handleClick} />
            <div style={styles}>
                <p>{winner ? "Winner: " + winner : "Next Player: " + (xIsNext ? "X" : "O")}</p>
                {renderMoves()}
            </div>
        </>
        
    )
}