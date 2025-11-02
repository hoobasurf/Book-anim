import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

// Composant EnvironmentSelector
function EnvironmentSelector({ setEnvironment }) {
  const environments = ["Savane", "Océan", "Ferme", "Forêt"];
  return (
    <div>
      <h2>Choisis un environnement :</h2>
      {environments.map((env) => (
        <button key={env} onClick={() => setEnvironment(env)}>
          {env}
        </button>
      ))}
    </div>
  );
}

// Composant AnimalSelector
function AnimalSelector({ environment, setAnimal }) {
  const animals = {
    Savane: ["Lion"],
    Océan: ["Dauphin"],
    Ferme: ["Vache"],
    Forêt: ["Renard"],
  };
  return (
    <div>
      <h2>Choisis un animal dans {environment} :</h2>
      {animals[environment].map((a) => (
        <button key={a} onClick={() => setAnimal(a)}>
          {a}
        </button>
      ))}
    </div>
  );
}

// Composant Coloring
function Coloring({ environment, animal, onAnimate }) {
  const [color, setColor] = useState("#ff0000");

  useEffect(() => {
    const saved = localStorage.getItem(`${environment}_${animal}`);
    if (saved) setColor(saved);
  }, []);

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
          style={{ filter: `hue-rotate(${color})` }}
        />
      </div>
      <button onClick={onAnimate}>Voir animation</button>
    </div>
  );
}

// Composant Animation
function Animation({ environment, animal, onBack }) {
  return (
    <div>
      <h2>Animation du {animal}</h2>
      <video
        src={`${environment.toLowerCase()}_${animal.toLowerCase()}.mp4`}
        autoPlay
        loop
        controls
        style={{ maxWidth: "100%" }}
      />
      <br />
      <button onClick={onBack}>Retour au coloriage</button>
    </div>
  );
}

// Composant App principal
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

const root = createRoot(document.getElementById("root"));
root.render(<App />);
