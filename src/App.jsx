import React, { useState } from "react";
import EnvironmentSelector from "./environmentselector.jsx";
import AnimalSelector from "./animalselector.jsx";
import Coloring from "./coloring.jsx";
import Animation from "./animation.jsx";

export default function App() {
  const [environment, setEnvironment] = useState("savane");
  const [animal, setAnimal] = useState("lion");
  const [showAnimation, setShowAnimation] = useState(false);

  return (
    <div className="app">
      <h1>BlinkBook</h1>

      <EnvironmentSelector setEnvironment={setEnvironment} />
      <AnimalSelector environment={environment} setAnimal={setAnimal} />

      <button onClick={() => setShowAnimation(!showAnimation)}>
        {showAnimation ? "Voir Coloriage" : "Voir Animation"}
      </button>

      {showAnimation ? (
        <Animation environment={environment} animal={animal} />
      ) : (
        <Coloring environment={environment} animal={animal} />
      )}
    </div>
  );
}
