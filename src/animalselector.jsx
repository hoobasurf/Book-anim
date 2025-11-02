import React from "react";

const animals = {
  savane: ["lion"],
  ocean: ["dauphin"],
  ferme: ["vache"],
  foret: ["renard"]
};

export default function AnimalSelector({ environment, setAnimal }) {
  return (
    <div className="animal-selector">
      {animals[environment].map((a) => (
        <button key={a} onClick={() => setAnimal(a)}>
          {a}
        </button>
      ))}
    </div>
  );
}
