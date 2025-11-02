import React, { useState } from "react";
import EnvironmentSelector from "./environmentselector.jsx";
import AnimalSelector from "./animalselector.jsx";
import Coloring from "./coloring.jsx";
import Animation from "./animation.jsx";

function App() {
  const [environment, setEnvironment] = useState(null);
  const [animal, setAnimal] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>BlinkBook Interactive</h1>

      {!environment && <EnvironmentSelector setEnvironment={setEnvironment} />}

      {environment && !animal && (
        <AnimalSelector environment={environment} setAnimal={setAnimal} />
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

export default App;
