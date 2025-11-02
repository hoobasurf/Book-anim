import React from "react";

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

export default EnvironmentSelector;
