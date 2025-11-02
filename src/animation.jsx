import React from "react";

export default function Animation({ environment, animal }) {
  const videoSrc = `/${environment}_${animal}.mp4`;

  return (
    <div className="animation">
      <video src={videoSrc} autoPlay loop controls width="300" />
    </div>
  );
}
