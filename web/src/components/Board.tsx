import React, { useEffect, useRef } from 'react';

interface BoardProps {
  squares: (string | null)[];
  onClick: (i: number) => void;
  winningCombination: number[] | null;
}

export default function Board({ squares, onClick, winningCombination }: BoardProps): React.ReactElement {
  const gridRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    drawGridLines();
  }, []);

  function drawGridLines() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const grid = gridRef.current;

    if (!grid) return;

    // Clear any existing grid lines
    while (grid.firstChild) {
      grid.removeChild(grid.firstChild);
    }

    // Vertical Lines
    const vLine1 = createGridLine(svgNS, 105, 0, 105, 310);
    grid.appendChild(vLine1);

    const vLine2 = createGridLine(svgNS, 205, 0, 205, 310);
    grid.appendChild(vLine2);

    // Horizontal Lines
    const hLine1 = createGridLine(svgNS, 0, 105, 310, 105);
    grid.appendChild(hLine1);

    const hLine2 = createGridLine(svgNS, 0, 205, 310, 205);
    grid.appendChild(hLine2);
  }

  function createGridLine(svgNS: string, x1: number, y1: number, x2: number, y2: number) {
    const line = document.createElementNS(svgNS, 'line') as SVGElement;
    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1.toString());
    line.setAttribute('x2', x2.toString());
    line.setAttribute('y2', y2.toString());
    line.setAttribute('stroke', 'black');
    line.setAttribute('stroke-width', '5');
    line.setAttribute('class', 'grid-line');
    // Calculate total length and set stroke-dasharray and stroke-dashoffset
    const length = Math.hypot(x2 - x1, y2 - y1);
    line.style.strokeDasharray = `${length}`;
    line.style.strokeDashoffset = `${length}`;
    return line;
  }

  function handleCellClick(index: number) {
    onClick(index);
  }

  useEffect(() => {
    drawMarks();
  }, [squares]);

  function drawMarks() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const grid = gridRef.current;

    if (!grid) return;

    // Remove existing marks
    const existingMarks = grid.querySelectorAll('.mark-path, .highlight-rect');
    existingMarks.forEach((mark) => grid.removeChild(mark));

    squares.forEach((player, index) => {
      if (player) {
        const x = (index % 3) * 105 + 50;
        const y = Math.floor(index / 3) * 105 + 50;

        if (player === 'X') {
          // Draw an X
          const path = document.createElementNS(svgNS, 'path');
          const d = `
            M ${x - 30} ${y - 30} L ${x + 30} ${y + 30}
            M ${x + 30} ${y - 30} L ${x - 30} ${y + 30}
          `;
          path.setAttribute('d', d);
          path.setAttribute('stroke', '#ff4d4d');
          path.setAttribute('stroke-width', '10');
          path.setAttribute('fill', 'none');
          path.setAttribute('class', 'mark-path');
          grid.appendChild(path);

          const totalLength = path.getTotalLength();
          path.style.strokeDasharray = `${totalLength}`;
          path.style.strokeDashoffset = `${totalLength}`;

          // Animate drawing
          animateDrawing(path, totalLength);
        } else {
          // Draw an O
          const circle = document.createElementNS(svgNS, 'circle');
          circle.setAttribute('cx', x.toString());
          circle.setAttribute('cy', y.toString());
          circle.setAttribute('r', '40');
          circle.setAttribute('stroke', '#1a75ff');
          circle.setAttribute('stroke-width', '10');
          circle.setAttribute('fill', 'none');
          circle.setAttribute('class', 'mark-path');
          grid.appendChild(circle);

          const circumference = 2 * Math.PI * 40;
          circle.style.strokeDasharray = `${circumference}`;
          circle.style.strokeDashoffset = `${circumference}`;

          // Animate drawing
          animateDrawing(circle, circumference);
        }
      }
    });

    // Highlight winning combination if exists
    if (winningCombination) {
      highlightWinningCells(winningCombination);
    }
  }

  function animateDrawing(element: SVGElement, totalLength: number) {
    let startTime: number | null = null;
    const duration = 500; // Animation duration in ms

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      const progress = Math.min(elapsed / duration, 1);
      element.style.strokeDashoffset = `${totalLength * (1 - progress)}`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    requestAnimationFrame(animate);
  }

  function highlightWinningCells(condition: number[]) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const grid = gridRef.current;

    if (!grid) return;

    condition.forEach((index) => {
      const x = (index % 3) * 105;
      const y = Math.floor(index / 3) * 105;

      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', (x + 5).toString());
      rect.setAttribute('y', (y + 5).toString());
      rect.setAttribute('width', '95');
      rect.setAttribute('height', '95');
      rect.setAttribute('fill', 'yellow');
      rect.setAttribute('opacity', '0.3');
      rect.setAttribute('class', 'highlight-rect');
      grid.appendChild(rect);
    });
  }

  const cellDivs = [];
  for (let i = 0; i < 9; i++) {
    cellDivs.push(
      <div
        key={i}
        className='cell'
        data-cell-index={i}
        onClick={() => handleCellClick(i)}
      ></div>
    );
  }

  return (
    <div id='game-container'>
      <svg id='grid' xmlns='http://www.w3.org/2000/svg' ref={gridRef}>
        {/* Grid lines are added dynamically */}
      </svg>
      {/* Invisible clickable cells over the grid */}
      {cellDivs}
    </div>
  );
}