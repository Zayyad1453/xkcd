import React from "react";

export const ErrorFallback = ({ handleRandom, goToHome }) => {
  return (
    <div className="error-fallback">
      <h3>We cant seem to find that comic :(</h3>
      <p className="link" onClick={handleRandom}>
        Click here to go to a random comic
      </p>
      <p className="link" onClick={goToHome}>
        Click here to go to the latest comic
      </p>
    </div>
  );
};
