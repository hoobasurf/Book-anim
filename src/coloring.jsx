import React, { useState, useEffect } from "react";

function Coloring({ environment, animal, onAnimate }) {
  const [color, setColor] = useState("#ff0000");

  useEffect(() => {
    const saved = localStorage.getItem(`${environment}_${animal}`);
    if (saved) setColor(saved);
  }, [environment, animal]);

  const saveColor = (c) => {
    setColor(c);
    localStorage.setItem(`${environment}_${animal}`, c);
  };

  return (
    <div>
      <h2>Colorie le {animal} :</h2>
      <div>
        <button onClick={() => saveColor("#ff0000")}>Rouge</button>
        <button onClick={() => saveColor("#00ff00")}>Vert</button>
        <button onClick={() => saveColor("#0000ff")}>Bleu</button>
      </div>
      <div style={{ margin: "20px" }}>
        <img
          src={`${environment.toLowerCase()}_${animal.toLowerCase()}.svg`}
          alt={animal}
          width="300"
          style={{
            filter: `hue-rotate(${color})`,
          }}
        />
      </div>
      <button onClick={onAnimate}>Voir animation</button>
    </div>
  );
}

export default Coloring;
