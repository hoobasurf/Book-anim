import React from "react";

const environments = ["Savane", "Océan", "Ferme", "Forêt"];

export default function EnvironmentSelector({ setEnvironment }) {
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
