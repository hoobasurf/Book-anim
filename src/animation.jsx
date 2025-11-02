import React from "react";

function Animation({ environment, animal, onBack }) {
  return (
    <div>
      <h2>Animation du {animal}</h2>
      <video
        src={`${environment.toLowerCase()}_${animal.toLowerCase()}.mp4`}
        autoPlay
        loop
        controls
        style={{ maxWidth: "100%", borderRadius: "10px" }}
      />
      <br />
      <button onClick={onBack}>Retour au coloriage</button>
    </div>
  );
}

export default Animation;
