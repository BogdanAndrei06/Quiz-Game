import React, { useState } from "react";

// Componenta de start este primul ecran pe care utilizatorul il vede.
// Aici jucatorul introduce numele, selecteaza categoria si dificultatea,
// si poate alege intre modul normal sau modul 1v1.
// Componenta trimite aceste date catre App.js pentru a porni jocul.
function StartScreen({
  onStart,
  onStartPvP,
  difficulty,
  setDifficulty,
  category,
  setCategory,
}) {

  // Stocam numele introdus si eventualele erori
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Functie apelata cand utilizatorul apasa "Start Game"
  // Verificam daca numele este completat, iar daca da, il formatam si continuam
  function handleClick() {
    if (!name.trim()) {
      setError("Please enter your name!");
      return;
    }
    setError("");

    // Formatam numele jucatorului pentru a arata corect
    const fixedName =
      name.trim().charAt(0).toUpperCase() +
      name.trim().slice(1).toLowerCase();

    // Trimitem catre App.js datele necesare pentru a porni jocul
    onStart(fixedName, difficulty, "en", category);
  }

  return (
    <div className="start-screen">

      {/* Titlul aplicatiei */}
      <h1 className="title">Quizly</h1>

      {/* Sectiune cu inputuri si selectoare */}
      <div className="stack">
        
        {/* Introducere nume jucator */}
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="name-input"
        />

        {/* Afisam eroarea daca numele nu este introdus */}
        {error && <p className="error">{error}</p>}

        {/* Selectare categorie */}
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

        {/* Selectare dificultate */}
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

      {/* Sectiunea cu butoanele mari pentru cele doua moduri de joc */}
      <div
        className="start-btn-container"
        style={{
          marginTop: "28px",
          display: "flex",
          justifyContent: "center",
          gap: "22px"
        }}
      >

        {/* Buton pentru modul single-player */}
        <button
          onClick={handleClick}
          className="start-btn-large"
          style={{
            width: "180px",
            height: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          Start Game
        </button>

        {/* Buton pentru modul 1v1 */}
        <button
          onClick={onStartPvP}
          className="start-btn-large"
          style={{
            width: "180px",
            height: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg,#ff5f6d,#ffc371)"
          }}
        >
          1v1 Mode
        </button>

      </div>
    </div>
  );
}

export default StartScreen;
