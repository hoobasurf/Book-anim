import React from "react";

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

export default AnimalSelector;
