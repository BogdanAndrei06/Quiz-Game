import React from "react";

// Componenta care afiseaza rezultatul final dupa terminarea unui joc single-player.
// Aici se afiseaza numele jucatorului, scorul obtinut si un buton pentru a reincepe jocul.
// Aceasta componenta este afisata doar in modul normal (nu in PvP).
function ResultScreen({ playerName, score, onRestart }) {
  return (
    <div className="quiz-container">
      
      {/* Afisam numele jucatorului si un mesaj final */}
      <h2>Felicitari, {playerName}!</h2>

      {/* Afisam scorul final obtinut la finalul celor 10 intrebari */}
      <p style={{ fontSize: 18 }}>
        Scor final: <b>{score}</b>
      </p>

      {/* Buton care permite inceperea unui joc nou */}
      <button className="start-btn" onClick={onRestart}>
        Joaca din nou
      </button>

    </div>
  );
}

export default ResultScreen;
