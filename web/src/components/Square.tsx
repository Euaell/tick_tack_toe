import React from "react";

const style = {
  background: "lightblue",
  border: "2px solid darkblue",
  fontSize: "30px",
  fontWeight: "800",
  cursor: "pointer",
  outline: "none",
};

export default function Square({ value, onClick }: { value: string, onClick: () => void }): React.ReactElement {
  return (
    <button style={style} className="square" onClick={onClick}>
      {value}
    </button>
  );
}
