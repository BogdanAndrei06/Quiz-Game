import React, { useEffect, useState, useCallback } from "react";

// Componenta care gestioneaza modul single-player al quizului.
// Aici se incarca intrebarile, se afiseaza timerul, se proceseaza raspunsurile
// si se salveaza scorul in localStorage.
function QuizScreen({ playerName, difficulty, language, category, onGameEnd }) {

  // Lista intrebarilor incarcate de la API
  const [questions, setQuestions] = useState([]);

  // Indexul intrebarii curente
  const [current, setCurrent] = useState(0);

  // Scorul real si scorul animat afisat pe ecran
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  // Stari pentru incarcarea datelor si timer
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);

  // Controleaza daca intrebare a fost raspunsa si ce raspuns a fost selectat
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);

  // Power-up-uri: 50/50, skip si lista raspunsurilor eliminate
  const [fiftyUsed, setFiftyUsed] = useState(false);
  const [skipUsed, setSkipUsed] = useState(false);
  const [disabledAnswers, setDisabledAnswers] = useState([]);

  // Incarcare intrebari de la API atunci cand se schimba categoria sau dificultatea
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const url = `https://opentdb.com/api.php?amount=10&type=multiple&category=${category}&difficulty=${difficulty}`;
        const res = await fetch(url);
        const data = await res.json();

        // Mapare intrebare + raspunsuri in format intern
        const final = data.results.map((q) => ({
          question: q.question,
          answers: shuffle([...q.incorrect_answers, q.correct_answer]),
          correct: q.correct_answer,
        }));

        setQuestions(final);
      } catch (e) {
        console.error("Eroare API:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [difficulty, category]);

  // Functie pentru a amesteca raspunsurile
  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  // Animatie pentru cresterea treptata a scorului pe ecran
  useEffect(() => {
    if (displayScore === score) return;

    const start = displayScore;
    const end = score;
    const duration = 400;
    const steps = 20;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      const progress = currentStep / steps;
      const value = Math.round(start + (end - start) * progress);
      setDisplayScore(value);

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Functia care proceseaza raspunsul dat la intrebare
  const handleAnswer = useCallback(
    (answer) => {
      if (disabledAnswers.includes(answer)) return;

      setAnswered(true);
      setSelected(answer);

      const isCorrect = answer === questions[current]?.correct;

      // Actualizarea scorului + verificarea ultimei intrebari
      setScore((prev) => {
        const updated = isCorrect ? prev + 100 : prev - 50;
        const isLast = current + 1 === questions.length;

        if (isLast) {
          setTimeout(() => {
            saveScore(updated);
            onGameEnd && onGameEnd();
          }, 1500);
        }

        return updated;
      });

      // Trecerea la urmatoarea intrebare cu o mica intarziere
      setTimeout(() => {
        const next = current + 1;
        if (next < questions.length) {
          setCurrent(next);
          setAnswered(false);
          setSelected(null);
          setTimeLeft(15);
          setDisabledAnswers([]);
        }
      }, 1500);
    },
    [questions, current, disabledAnswers, onGameEnd]
  );

  // Power-up 50/50: elimina doua raspunsuri gresite
  function useFifty() {
    if (fiftyUsed) return;
    setFiftyUsed(true);

    const q = questions[current];
    const wrongAnswers = q.answers.filter((a) => a !== q.correct);
    const toDisable = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);

    setDisabledAnswers(toDisable);
  }

  // Power-up Skip: tratat ca raspuns corect (+100p)
  function useSkip() {
    if (skipUsed) return;
    setSkipUsed(true);

    setAnswered(true);
    setSelected("SKIPPED");

    setScore((prev) => {
      const updated = prev + 100;
      const isLast = current + 1 === questions.length;

      if (isLast) {
        setTimeout(() => {
          saveScore(updated);
          onGameEnd && onGameEnd();
        }, 1500);
      }

      return updated;
    });

    // Trecerea la urmatoarea intrebare
    setTimeout(() => {
      const next = current + 1;
      if (next < questions.length) {
        setCurrent(next);
        setAnswered(false);
        setSelected(null);
        setTimeLeft(15);
        setDisabledAnswers([]);
      }
    }, 1200);
  }

  // Timerul care scade la fiecare secunda
  useEffect(() => {
    if (loading || answered) return;
    if (timeLeft === 0) {
      handleAnswer(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, answered, loading, handleAnswer]);

  // Salvarea scorului in localStorage si actualizarea clasamentului
  function saveScore(finalScore) {
    try {
      const mapCat = {
        9: "General Knowledge",
        11: "Movies",
        12: "Music",
        17: "Science",
        21: "Sports",
        22: "Geography",
        23: "History",
      };

      const scores = JSON.parse(localStorage.getItem("quizLeaderboard")) || [];

      const idx = scores.findIndex(
        (p) => p.name.toLowerCase() === playerName.toLowerCase()
      );

      const entry = {
        name: playerName,
        score: finalScore,
        difficulty,
        language: "en",
        category: mapCat[Number(category)] || "Other",
      };

      if (idx !== -1) {
        if (finalScore > scores[idx].score)
          scores[idx] = { ...scores[idx], ...entry };
        else scores[idx] = { ...scores[idx], difficulty, category: entry.category };
      } else {
        scores.push(entry);
      }

      localStorage.setItem("quizLeaderboard", JSON.stringify(scores));
      localStorage.setItem("lastPlayer", playerName);
    } catch (e) {
      console.error("Eroare salvare scor:", e);
    }
  }

  // Afisam mesaj de incarcare pana cand intrebarile sunt preluate din API
  if (loading)
    return (
      <h2 style={{ textAlign: "center" }}>
        Loading questions ({difficulty})...
      </h2>
    );

  const q = questions[current] || {};

  return (
    <div className="quiz-container">

      {/* Afisarea numelui jucatorului */}
      <h2 className="player-name">Player: {playerName}</h2>

      {/* Timer si scor */}
      <div className="score-timer">
        <p>Time: {timeLeft}s</p>
        <p>Score: {displayScore}</p>
      </div>

      {/* Bara vizuala de timp */}
      <div className="time-bar">
        <div
          className="time-fill"
          style={{
            width: `${(timeLeft / 15) * 100}%`,
            background:
              timeLeft <= 5
                ? "linear-gradient(90deg, #ff4b4b, #ff7b7b)"
                : "linear-gradient(90deg, #4b8df7, #66a6ff)",
          }}
        />
      </div>

      {/* Afisarea intrebarii */}
      <h3
        className="question"
        dangerouslySetInnerHTML={{ __html: q.question }}
      />

      {/* Power-up-urile disponibile */}
      <div className="powerups">
        <button
          className={`power-btn ${fiftyUsed ? "used" : ""}`}
          onClick={useFifty}
          disabled={fiftyUsed}
        >
          50/50
        </button>

        <button
          className={`power-btn ${skipUsed ? "used" : ""}`}
          onClick={useSkip}
          disabled={skipUsed}
        >
          Skip
        </button>
      </div>

      {/* Afisarea raspunsurilor */}
      <div className="answers">
        {q.answers?.map((a, i) => {
          const isCorrect = a === q.correct;
          const isSelected = a === selected;
          const isDisabled = disabledAnswers.includes(a);

          let cls = "answer-btn";
          if (isDisabled) cls += " disabled";
          if (answered && isCorrect) cls += " correct";
          else if (answered && isSelected && !isCorrect) cls += " wrong";

          return (
            <button
              key={i}
              className={cls}
              disabled={isDisabled}
              onClick={() => !answered && handleAnswer(a)}
              dangerouslySetInnerHTML={{ __html: a }}
            />
          );
        })}
      </div>

      {/* Progresul intrebarilor */}
      <p className="progress">
        Question {current + 1} / {questions.length}
      </p>
    </div>
  );
}

export default QuizScreen;
