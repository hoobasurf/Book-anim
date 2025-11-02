import React, { useState } from "react";
import CanvasDraw from "react-canvas-draw";

export default function Coloring({ environment, animal }) {
  const [brushColor, setBrushColor] = useState("#ff0000");

  return (
    <div className="coloring">
      <div className="color-buttons">
        <button onClick={() => setBrushColor("#ff0000")}>Rouge</button>
        <button onClick={() => setBrushColor("#00ff00")}>Vert</button>
        <button onClick={() => setBrushColor("#0000ff")}>Bleu</button>
        <button onClick={() => setBrushColor("#000000")}>Noir</button>
      </div>

      <CanvasDraw
        brushColor={brushColor}
        brushRadius={5}
        lazyRadius={0}
        canvasWidth={300}
        canvasHeight={300}
        imgSrc={`/${environment}_${animal}.svg`}
      />
    </div>
  );
}
