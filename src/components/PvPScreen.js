import React, { useEffect, useState } from "react";

// Numarul de intrebari pe jucator
const QUESTIONS_PER_PLAYER = 10;
const TOTAL_NEEDED = QUESTIONS_PER_PLAYER * 2;

// Componenta principala pentru modul Player vs Player
function PvPScreen({ players, difficulty, category, onMatchEnd }) {

  // Lista intrebarilor si starea de incarcare
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Indexul curent pentru fiecare jucator
  const [indexP1, setIndexP1] = useState(0);
  const [indexP2, setIndexP2] = useState(0);

  // 0 = Player1, 1 = Player2
  const [turn, setTurn] = useState(0);

  // Scorurile celor doi jucatori
  const [scores, setScores] = useState([0, 0]);

  // Stari pentru raspunsuri
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  // Power-ups individuale
  const [used5050, setUsed5050] = useState([false, false]);
  const [usedSkip, setUsedSkip] = useState([false, false]);
  const [reducedAnswers, setReducedAnswers] = useState([]);

 
  // Fetch automat pana cand se obtin exact 10 intrebari valide
  // Sistemul repeta request-uri pana are suficiente intrebari.
  useEffect(() => {
    async function loadQuestions() {
      let collected = [];

      while (collected.length < TOTAL_NEEDED) {
        const amountToFetch = TOTAL_NEEDED - collected.length;

        const url = `https://opentdb.com/api.php?amount=${amountToFetch}&type=multiple&category=${category}&difficulty=${difficulty}`;

        try {
          const r = await fetch(url);
          const d = await r.json();

          if (d.results) {
            const mapped = d.results.map((q) => ({
              question: q.question,
              answers: shuffle([...q.incorrect_answers, q.correct_answer]),
              correct: q.correct_answer,
            }));

            collected = [...collected, ...mapped];
          }

        } catch (_) {
          // In caz de eroare API, bucla continua pana reuseste
        }
      }

      setQuestions(collected.slice(0, TOTAL_NEEDED));
      setLoading(false);
    }

    loadQuestions();
  }, [category, difficulty]);

  // Amestecare raspunsuri
  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  const p1 = players[0];
  const p2 = players[1];

  // Impartim intrebarile intre cei doi jucatori
  const qP1 = questions.slice(0, QUESTIONS_PER_PLAYER);
  const qP2 = questions.slice(QUESTIONS_PER_PLAYER, TOTAL_NEEDED);

  // Cand ambii jucatori au terminat intrebarile → final de meci
  // Sistemul transmite scorurile catre App.js
  useEffect(() => {
    if (indexP1 >= QUESTIONS_PER_PLAYER && indexP2 >= QUESTIONS_PER_PLAYER) {
      onMatchEnd(scores, players);
    }
  }, [indexP1, indexP2]);

  // Gestionarea raspunsului selectat
  function handleAnswer(answer) {
    if (answered) return;

    const questionsForTurn = turn === 0 ? qP1 : qP2;
    const q = questionsForTurn[turn === 0 ? indexP1 : indexP2];
    if (!q) return;

    setAnswered(true);
    setSelected(answer);

    const correct = answer === q.correct;

    setScores((prev) => {
      const upd = [...prev];
      upd[turn] += correct ? 100 : -50;
      return upd;
    });

    setTimeout(() => goNextTurn(), 1200);
  }

  // Trecerea turului intre jucatori
  function goNextTurn() {
    setAnswered(false);
    setSelected(null);
    setReducedAnswers([]);

    if (turn === 0) {
      if (indexP1 < QUESTIONS_PER_PLAYER) setIndexP1((i) => i + 1);
      setTurn(1);
    } else {
      if (indexP2 < QUESTIONS_PER_PLAYER) setIndexP2((i) => i + 1);
      setTurn(0);
    }
  }

  // Power-up 50/50
  function use5050() {
    if (answered || used5050[turn]) return;

    const q = turn === 0 ? qP1[indexP1] : qP2[indexP2];
    if (!q) return;

    const wrong = q.answers.filter((a) => a !== q.correct);
    const newSet = [q.correct, wrong[0]].sort(() => Math.random() - 0.5);

    setReducedAnswers(newSet);

    const upd = [...used5050];
    upd[turn] = true;
    setUsed5050(upd);
  }

  // Power-up Skip (considerat raspuns corect)
  function skipQuestion() {
    if (answered || usedSkip[turn]) return;

    const upd = [...usedSkip];
    upd[turn] = true;
    setUsedSkip(upd);

    const questionsForTurn = turn === 0 ? qP1 : qP2;
    const q = questionsForTurn[turn === 0 ? indexP1 : indexP2];
    if (!q) return;

    setSelected(q.correct);
    setAnswered(true);

    // Skip = +100 puncte
    setScores(prev => {
      const s = [...prev];
      s[turn] += 100;
      return s;
    });

    setTimeout(() => {
      goNextTurn();
    }, 1200);
  }

  // Cand se incarca intrebarile, afisam un mesaj
  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading match…</h2>;
  }

  // Selectam intrebarea curenta pentru jucatorul la rand
  const currentList = turn === 0 ? qP1 : qP2;
  const currentIndex = turn === 0 ? indexP1 : indexP2;
  const q = currentList[currentIndex];
  if (!q) return null;

  const answersToShow = reducedAnswers.length ? reducedAnswers : q.answers;

  return (
    <div className="pvp-wrapper">

      {/* Banner cu numele jucatorilor */}
      <div className="pvp-banner">
        <span className="pvp-p1"> {p1}</span>
        <span className="pvp-vs"> VS </span>
        <span className="pvp-p2"> {p2}</span>
      </div>

      {/* Split screen: fiecare jucator pe cate o parte */}
      <div className="pvp-split">

        {/* Player 1 */}
        <div className={`pvp-side ${turn !== 0 ? "blurred" : ""}`}>
          <h2 className="pvp-title">{p1}</h2>

          {turn === 0 ? (
            <>
              <h3 className="pvp-question" dangerouslySetInnerHTML={{ __html: q.question }} />

              {/* Raspunsuri */}
              <div className="pvp-answers">
                {answersToShow.map((a, i) => (
                  <button
                    key={i}
                    className={`pvp-answer-btn ${
                      answered && a === q.correct ? "correct" : ""
                    } ${
                      answered && selected === a && a !== q.correct ? "wrong" : ""
                    }`}
                    dangerouslySetInnerHTML={{ __html: a }}
                    onClick={() => handleAnswer(a)}
                  />
                ))}
              </div>

              {/* Power-ups */}
              <div className="pvp-powerups">
                <button
                  className={`powerup-btn ${used5050[0] ? "disabled" : ""}`}
                  onClick={use5050}
                >
                  50/50
                </button>
                <button
                  className={`powerup-btn ${usedSkip[0] ? "disabled" : ""}`}
                  onClick={skipQuestion}
                >
                  Skip
                </button>
              </div>
            </>
          ) : (
            <p className="waiting-text">Waiting for Player 2…</p>
          )}
        </div>

        {/* Player 2 */}
        <div className={`pvp-side ${turn !== 1 ? "blurred" : ""}`}>
          <h2 className="pvp-title">{p2}</h2>

          {turn === 1 ? (
            <>
              <h3 className="pvp-question" dangerouslySetInnerHTML={{ __html: q.question }} />

              <div className="pvp-answers">
                {answersToShow.map((a, i) => (
                  <button
                    key={i}
                    className={`pvp-answer-btn ${
                      answered && a === q.correct ? "correct" : ""
                    } ${
                      answered && selected === a && a !== q.correct ? "wrong" : ""
                    }`}
                    dangerouslySetInnerHTML={{ __html: a }}
                    onClick={() => handleAnswer(a)}
                  />
                ))}
              </div>

              <div className="pvp-powerups">
                <button
                  className={`powerup-btn ${used5050[1] ? "disabled" : ""}`}
                  onClick={use5050}
                >
                  50/50
                </button>
                <button
                  className={`powerup-btn ${usedSkip[1] ? "disabled" : ""}`}
                  onClick={skipQuestion}
                >
                  Skip
                </button>
              </div>
            </>
          ) : (
            <p className="waiting-text">Waiting for Player 1…</p>
          )}
        </div>
      </div>

      {/* Afisarea progresului: intrebarea X din 10 */}
      <div className="pvp-counter">
        {currentIndex + 1} / {QUESTIONS_PER_PLAYER}
      </div>

    </div>
  );
}

export default PvPScreen;
