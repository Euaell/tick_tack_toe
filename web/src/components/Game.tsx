import React from "react";

import Board from "@/components/Board";
import { calculateWinner } from "@/helpers";

const styles = {
    width: "200px",
    margin: "20px auto",
}

export default function Game(): React.ReactElement {
    const [history, setHistory] = React.useState([Array(9).fill(null)]);
    const [stepNumber, setStepNumber] = React.useState(0);
    const [xIsNext, setXIsNext] = React.useState(true);
    const winner = calculateWinner(history[stepNumber]);
    
    function handleClick(i: number) {
        const timeInHistory = history.slice(0, stepNumber + 1);
        const current = timeInHistory[stepNumber];
        const squares = [...current];
        if (winner || squares[i]) return;
        squares[i] = xIsNext ? "X" : "O";
        
        setHistory([...timeInHistory, squares]);
        setStepNumber(timeInHistory.length);
        setXIsNext(!xIsNext);
    }

    function jumpTo(step: number) {
        setStepNumber(step);
        setXIsNext(step % 2 === 0);        
    }

    function renderMoves() {
        return history.map((_step: any, move: number) => {
            const destination = move ? `Go to move #${move}` : "Go to start";
            return (
                <li key={move}>
                    <button onClick={() => jumpTo(move)}>{destination}</button>
                </li>
            )
        })
    }

    return (
        <>
            <Board squares={history[stepNumber]} onClick={handleClick} />
            <div style={styles}>
                <p>{winner ? "Winner: " + winner : "Next Player: " + (xIsNext ? "X" : "O")}</p>
                {renderMoves()}
            </div>
        </>
        
    )
}