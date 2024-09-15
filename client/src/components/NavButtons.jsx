import React from "react";

export const NavButtons = ({ currentComicId, handleNav, handleRandom }) => {
  return (
    <div className="comic-nav-buttons-container">
      <button
        className="comic-nav-button"
        onClick={() => handleNav(currentComicId - 1)}
        disabled={!!currentComicId && currentComicId <= 1}
      >
        Previous
      </button>
      <button
        className="comic-nav-button"
        onClick={() => handleNav(currentComicId + 1)}
      >
        Next
      </button>
      <button className="comic-nav-button" onClick={handleRandom}>
        Random
      </button>
    </div>
  );
};
