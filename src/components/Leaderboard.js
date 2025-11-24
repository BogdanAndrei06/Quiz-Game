import React, { useEffect, useState } from "react";

function Leaderboard({ refreshTrigger }) {

  // Lista scorurilor salvate in localStorage
  const [scores, setScores] = useState([]);

  // Cand refreshTrigger se modifica, reincarcam leaderboardul
  useEffect(() => {
    load();
  }, [refreshTrigger]);

  // Incarca scorurile din localStorage si le sorteaza descrescator
  function load() {
    const stored = JSON.parse(localStorage.getItem("quizLeaderboard")) || [];
    const sorted = stored.sort((a, b) => b.score - a.score);
    setScores(sorted);
  }

  // Buton pentru stergerea intregului clasament
  function handleReset() {
    if (window.confirm("Esti sigur ca vrei sa stergi tot clasamentul?")) {
      localStorage.removeItem("quizLeaderboard");
      setScores([]);
    }
  }

  return (
    <div className="leaderboard-content">

      {/* Titlu secțiune Leaderboard */}
      <h2>Leaderboard</h2>

      {/* Daca nu exista scoruri salvate, afisam un mesaj */}
      {scores.length === 0 ? (
        <p className="leaderboard-empty">No scores saved yet.</p>
      ) : (

        /* Afisarea scorurilor sortate */
        <ul className="leaderboard-list">
          {scores.map((p, i) => (
            <li key={i} className="leaderboard-item">

              {/* Numele jucatorului si detalii despre joc */}
              <div className="leaderboard-name">
                {p.name}

                {/* Difficulty + Category afisate sub nume */}
                <div className="leaderboard-details">
                  <span>{p.difficulty.toUpperCase()}</span> •{" "}
                  <span>{p.category}</span>
                </div>
              </div>

              {/* Scorul final + data salvarii */}
              <div className="leaderboard-score">
                {p.score}p / 1000p
                <div className="leaderboard-date">
                  {p.date || new Date().toLocaleDateString("ro-RO")}
                </div>
              </div>

            </li>
          ))}
        </ul>
      )}

      {/* Buton reset leaderboard, afisat doar daca exista punctaje */}
      {scores.length > 0 && (
        <button
          className="start-btn-large"
          style={{
            marginTop: "20px",
            width: "100%",
            justifyContent: "center",
            textAlign: "center"
          }}
          onClick={handleReset}
        >
          Reset Leaderboard
        </button>
      )}

    </div>
  );
}

export default Leaderboard;
