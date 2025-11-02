import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import EnvironmentSelector from "./EnvironmentSelector.jsx";
import AnimalSelector from "./AnimalSelector.jsx";
import Coloring from "./Coloring.jsx";
import Animation from "./Animation.jsx";

function App() {
  const [environment, setEnvironment] = useState(null);
  const [animal, setAnimal] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>BlinkBook Interactive</h1>

      {!environment && (
        <EnvironmentSelector setEnvironment={setEnvironment} />
      )}

      {environment && !animal && (
        <AnimalSelector
          environment={environment}
          setAnimal={setAnimal}
        />
      )}

      {animal && !showAnimation && (
        <Coloring
          environment={environment}
          animal={animal}
          onAnimate={() => setShowAnimation(true)}
        />
      )}

      {showAnimation && (
        <Animation
          environment={environment}
          animal={animal}
          onBack={() => setShowAnimation(false)}
        />
      )}
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
