import React from "react";

const animals = {
  Savane: ["Lion"],
  Océan: ["Dauphin"],
  Ferme: ["Vache"],
  Forêt: ["Renard"],
};

export default function AnimalSelector({ environment, setAnimal }) {
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
