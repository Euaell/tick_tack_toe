import React from "react";
import Square from "@/components/Square";

const style = {
  border: "4px solid darkblue",
  borderRadius: "10px",
  width: "250px",
  height: "250px",
  margin: "0 auto",
  display: "grid",
  gridTemplate: "repeat(3, 1fr) / repeat(3, 1fr)",
};

export default function Board({ squares, onClick }: { squares: any, onClick: (i: number) => void }): React.ReactElement {
  return (
    <div style={style}>
      {squares.map((square: any, i: number) => (
        <Square key={i} value={square} onClick={() => onClick(i)} />
      ))}
    </div>
  );
}
