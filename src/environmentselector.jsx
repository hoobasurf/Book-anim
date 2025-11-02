import React from "react";

export default function EnvironmentSelector({ setEnvironment }) {
  return (
    <div className="environment-selector">
      <button onClick={() => setEnvironment("savane")}>Savane</button>
      <button onClick={() => setEnvironment("ocean")}>Océan</button>
      <button onClick={() => setEnvironment("ferme")}>Ferme</button>
      <button onClick={() => setEnvironment("foret")}>Forêt</button>
    </div>
  );
}
