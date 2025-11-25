import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";

function WinnerScreen({ data, onExit }) {

  // extragem datele primite de la componenta PvPScreen
  // players = numele celor doi jucatori
  // scores = scorurile finale ale jucatorilor
  // winnerIndex = 0 sau 1, indica ce jucator a castigat; -1 inseamna egalitate
  const { players, scores, winnerIndex } = data;

  // stabilim numele castigatorului sau mesajul pentru egalitate
  const winnerName = winnerIndex === -1 ? "Draw!" : players[winnerIndex];

  // dimensiunea ferestrei, pentru a afisa confetti pe tot ecranul
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // ecranul de castigator ramane vizibil cateva secunde,
  // apoi se intoarce automat la meniul principal
  useEffect(() => {
    const timer = setTimeout(() => {
      onExit();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="winner-overlay">

      {/* efect vizual pentru castigator */}
      <Confetti width={windowSize.width} height={windowSize.height} />

      <div className="winner-box">

        {/* titlul cu numele castigatorului sau mesajul de egalitate */}
        <h1 className="winner-title">
          {winnerIndex === -1 ? "It's a Draw!" : `Winner: ${winnerName}`}
        </h1>

        {/* afisarea scorurilor finale */}
        <p className="winner-scores">
          {players[0]} <b>{scores[0]}p</b> vs {players[1]} <b>{scores[1]}p</b>
        </p>

      </div>
    </div>
  );
}

export default WinnerScreen;
