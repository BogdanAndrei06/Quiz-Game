import React, { useState } from "react";

// Ecranul unde se introduc numele jucatorilor si se selecteaza setarile pentru meciul 1v1
function PvPSetupScreen({ onStartPvPMatch, difficulty, setDifficulty, category, setCategory }) {

  // Numele celor doi jucatori
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

  // Gestionarea mesajelor de eroare
  const [error, setError] = useState("");

  // Functie simpla pentru a pune numele in format corect (Prima litera mare)
  function capitalize(name) {
    return name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
  }

  // Validarea numelor si pornirea meciului
  function handleStart() {
    // Verificam daca ambele nume sunt completate
    if (!p1.trim() || !p2.trim()) {
      setError("Both players must enter their names!");
      return;
    }

    setError("");

    // Trimitem catre componenta parinte numele jucatorilor si setarile selectate
    onStartPvPMatch(capitalize(p1), capitalize(p2), difficulty, category);
  }

  return (
    <div className="start-screen">

      {/* Titlul ecranului de configurare 1v1 */}
      <h1 className="title">1v1 Setup</h1>

      {/* Formularul pentru introducerea datelor */}
      <div className="stack">

        {/* Nume Player 1 */}
        <label className="label">Player 1 Name:</label>
        <input
          type="text"
          className="name-input"
          placeholder="Enter Player 1 name"
          value={p1}
          onChange={(e) => setP1(e.target.value)}
        />

        {/* Nume Player 2 */}
        <label className="label">Player 2 Name:</label>
        <input
          type="text"
          className="name-input"
          placeholder="Enter Player 2 name"
          value={p2}
          onChange={(e) => setP2(e.target.value)}
        />

        {/* Afișarea erorii daca jucatorii nu introduc numele */}
        {error && <p className="error">{error}</p>}

        {/* Selectarea categoriei intrebarilor */}
        <label className="label">Category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(Number(e.target.value))}
          className="select-input"
        >
          <option value={9}>General Knowledge</option>
          <option value={11}>Movies</option>
          <option value={12}>Music</option>
          <option value={17}>Science</option>
          <option value={21}>Sports</option>
          <option value={22}>Geography</option>
          <option value={23}>History</option>
        </select>

        {/* Selectarea dificultatii */}
        <label className="label">Difficulty:</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="select-input"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Butonul care porneste meciul 1v1 */}
      <div className="start-btn-container">
        <button onClick={handleStart} className="start-btn-large">
          Start Match
        </button>
      </div>

    </div>
  );
}

export default PvPSetupScreen;
