import React, { useState } from "react";
import StartScreen from "./components/StartScreen";
import QuizScreen from "./components/QuizScreen";
import Leaderboard from "./components/Leaderboard";
import "./App.css";
import PvPSetupScreen from "./components/PvPSetupScreen";
import PvPScreen from "./components/PvPScreen";
import WinnerScreen from "./components/WinnerScreen";

function App() {

  // State-uri principale care gestioneaza modul de joc, datele jucatorilor,
  // setarile quiz-ului si afisarea ecranelor.
  const [playerName, setPlayerName] = useState("");
  const [pvpPlayers, setPvpPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [category, setCategory] = useState(9);
  const [refreshLeaderboard, setRefreshLeaderboard] = useState(0);
  const [pvpMode, setPvPMode] = useState(false);

  // Date pentru ecranul de final al meciului 1v1
  const [showWinner, setShowWinner] = useState(false);
  const [winnerData, setWinnerData] = useState(null);

  // Porneste modul single player cu setarile alese
  function handleStart(name, diff, lang, cat) {
    setPlayerName(name);
    setDifficulty(diff);
    setCategory(cat);
    setGameStarted(true);
  }

  // Activeaza modul 1v1
  function handleStartPvP() {
    setPvPMode(true);
  }

  // Final pentru modul single player + actualizarea leaderboardului
  function handleGameEnd() {
    setGameStarted(false);
    setRefreshLeaderboard((x) => x + 1);
  }

  // Mapare id categorie -> nume
  const categoryMap = {
    9: "General Knowledge",
    11: "Movies",
    12: "Music",
    17: "Science",
    21: "Sports",
    22: "Geography",
    23: "History",
  };

  // Finalizarea unui meci 1v1: stabilirea castigatorului, afisarea rezultatului
  // si salvarea scorurilor in leaderboard
  function handleMatchEnd(scores, players) {
    const winnerIndex =
      scores[0] > scores[1] ? 0 :
      scores[0] < scores[1] ? 1 :
      -1;

    setWinnerData({
      players,
      scores,
      winnerIndex,
    });

    setShowWinner(true);

    // Salvare scoruri PvP in leaderboard local
    const stored = JSON.parse(localStorage.getItem("quizLeaderboard")) || [];

    stored.push({
      name: players[0] + " (PvP)",
      score: scores[0],
      difficulty,
      language: "en",
      category: categoryMap[category],
    });

    stored.push({
      name: players[1] + " (PvP)",
      score: scores[1],
      difficulty,
      language: "en",
      category: categoryMap[category],
    });

    localStorage.setItem("quizLeaderboard", JSON.stringify(stored));

    setRefreshLeaderboard((x) => x + 1);
  }

  return (
    <div className="app-container">
      <div className="main-content">

        {/*
          ECRAN START
          Afisat cand nu exista niciun joc in desfasurare si nu suntem in modul PvP
        */}
        {!gameStarted && !pvpMode && !showWinner && (
          <StartScreen
            onStart={handleStart}
            onStartPvP={handleStartPvP}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            category={category}
            setCategory={setCategory}
          />
        )}

        {/*
          MODUL SINGLE PLAYER
          Afisat doar daca jocul este pornit si nu ne aflam in modul PvP
        */}
        {gameStarted && !pvpMode && (
          <QuizScreen
            playerName={playerName}
            difficulty={difficulty}
            language="en"
            category={category}
            onGameEnd={handleGameEnd}
          />
        )}

        {/*
          SETUP PVP
          Ecran unde jucatorii introduc numele si selecteaza setarile meciului
        */}
        {pvpMode && !gameStarted && !showWinner && (
          <PvPSetupScreen
            onStartPvPMatch={(name1, name2, diff, cat) => {
              setPvpPlayers([name1, name2]);
              setDifficulty(diff);
              setCategory(cat);
              setGameStarted(true);
            }}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            category={category}
            setCategory={setCategory}
          />
        )}

        {/*
          ECRAN JOC 1v1
          Afisat cand meciul PvP este activ
        */}
        {pvpMode && gameStarted && !showWinner && (
          <PvPScreen
            players={pvpPlayers}
            difficulty={difficulty}
            category={category}
            onMatchEnd={(scores, players) => {
              handleMatchEnd(scores, players);
              setGameStarted(false);
              setPvPMode(false);
            }}
          />
        )}

        {/*
          ECRAN CASTIGATOR
          Afiseaza rezultatele finale ale meciului 1v1
        */}
        {showWinner && (
          <WinnerScreen
            data={winnerData}
            onExit={() => {
              setShowWinner(false);
            }}
          />
        )}
      </div>

      {/*
        LEADERBOARD
        Afisat permanent, exceptie in modul PvP si ecranul de castigator
      */}
      {!pvpMode && !showWinner && (
        <div className="leaderboard-container">
          <Leaderboard refreshTrigger={refreshLeaderboard} />
        </div>
      )}
    </div>
  );
}

export default App;
