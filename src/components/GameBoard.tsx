import React, { useState, useEffect } from 'react';
import { Player, Question, Box } from '../types';
import {
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6,
  CheckCircle, ArrowRightLeft
} from 'lucide-react';
import QuestionUploader from './QuestionUploader';

const DICE_FACES = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

const GRID_LAYOUT = [
  [15, 16, 17, 18, 19, 20],
  [14, -1, -1, -1, -1, -1],
  [13, 12, 11, 10, 9, 8],
  [-1, -1, -1, -1, -1, 7],
  [1, 2, 3, 4, 5, 6],
];

const BOXES: Box[] = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));

const INITIAL_PLAYERS: Player[] = [
  { id: 1, color: '#006884', position: 1, name: 'Boys' },
  { id: 2, color: '#FC6C85', position: 1, name: 'Girls' }
];

export function GameBoard() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [showGradeSelect, setShowGradeSelect] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [highlightBox, setHighlightBox] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [isRolling, setIsRolling] = useState(false);
  const [currentDiceFace, setCurrentDiceFace] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [animatingBoxes, setAnimatingBoxes] = useState<number[]>([]);

  useEffect(() => {
    let interval: number;
    if (isRolling) {
      let rollCount = 0;
      const totalRolls = 15;
      interval = setInterval(() => {
        rollCount++;
        if (rollCount < totalRolls) {
          setCurrentDiceFace(Math.floor(Math.random() * 6));
        } else {
          clearInterval(interval);
          if (diceRoll) setCurrentDiceFace(diceRoll - 1);
          setIsRolling(false);
        }
      }, 60);
    }
    return () => clearInterval(interval);
  }, [isRolling, diceRoll]);

  const switchTurn = () => {
    setCurrentPlayer((currentPlayer + 1) % players.length);
  };

  const rollDice = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceRoll(roll);
    setIsRolling(true);
    setTimeout(() => {
      const currentPos = players[currentPlayer].position;
      const targetPos = Math.min(currentPos + roll, BOXES.length);
      const path = Array.from(
        { length: targetPos - currentPos + 1 },
        (_, i) => currentPos + i
      );
      let delay = 0;
      let total_delay = 3000;
      let animation_delay = total_delay / path.length;
      path.forEach((pos) => {
        setTimeout(() => setHighlightBox(pos), delay);
        delay += animation_delay;
      });
      setTimeout(() => setShowGradeSelect(true), delay + 200);
    }, 1000);
  };

  const selectGrade = (grade: Question['grade']) => {
    if (!questions) return;
    const available = questions.filter(q => q.grade === grade && !answeredQuestions.has(q.id));
    if (available.length > 0) {
      const random = available[Math.floor(Math.random() * available.length)];
      setCurrentQuestion(random);
    }
    setShowGradeSelect(false);
  };

  const animatePlayerMovement = (start: number, end: number) => {
    const path = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    let delay = 0;
    path.forEach((position) => {
      setTimeout(() => {
        setPlayers(prev => prev.map(p =>
          p.id === players[currentPlayer].id ? { ...p, position } : p
        ));
        setAnimatingBoxes(prev => [...prev, position]);
        setTimeout(() => {
          setAnimatingBoxes(prev => prev.filter(box => box !== position));
        }, 500);
      }, delay);
      delay += 200;
    });
    return delay;
  };

  const answerQuestion = (answerIndex: number) => {
    if (!currentQuestion || !diceRoll) return;
    if (answerIndex === currentQuestion.correctAnswer) {
      setCurrentQuestion(null);
      setTimeout(() => {
        setShowCorrectAnswer(true);
        setTimeout(() => {
          setShowCorrectAnswer(false);
          const startPos = players[currentPlayer].position;
          const targetPos = Math.min(startPos + diceRoll, BOXES.length);
          const anim = animatePlayerMovement(startPos, targetPos);
          setTimeout(() => {
            setCurrentPlayer((currentPlayer + 1) % players.length);
            setDiceRoll(null);
            setHighlightBox(null);
          }, anim + 200);
        }, 400);
      }, 300);
    } else {
      setCurrentQuestion(null);
      setDiceRoll(null);
      setHighlightBox(null);
      setCurrentPlayer((currentPlayer + 1) % players.length);
    }
    setAnsweredQuestions(prev => new Set([...prev, currentQuestion.id]));
  };

  const renderBoard = () => {
    return GRID_LAYOUT.map((row, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 justify-center">
        {row.map((boxNumber, colIndex) => {
          if (boxNumber === -1) return <div key={`${rowIndex}-${colIndex}`} className="w-20 h-20" />;
          const playersInBox = players.filter(p => p.position === boxNumber);
          const isHighlighted = highlightBox === boxNumber;
          const isAnimating = animatingBoxes.includes(boxNumber);
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                w-20 h-20 bg-white/80 rounded-lg shadow-lg relative transition-all
                ${isHighlighted ? 'ring-4 ring-amber-500/50 scale-105' : ''}
                flex items-center justify-center
                ${boxNumber === 1 ? 'bg-amber-50/80' : ''}
                ${boxNumber === 20 ? 'bg-amber-100/80' : ''}
              `}
            >
              <span className="absolute top-2 left-2 text-sm text-amber-800/70">{boxNumber}</span>
              <div className="flex gap-2">
                {playersInBox.map(player => (
                  <div
                    key={player.id}
                    className={`w-6 h-6 rounded-full shadow-md ${isAnimating ? 'animate-bounce scale-110' : ''}`}
                    style={{ backgroundColor: player.color }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    ));
  };

  const DiceIcon = DICE_FACES[currentDiceFace];

  return (
    <>
      {!questions && <QuestionUploader onQuestionsParsed={setQuestions} />}
      <div className="min-h-screen p-8 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(90deg, #e8e0c3, #ffffff)' }}>
        <div className="mb-8 flex flex-col items-center">
          <h1 className="text-amber-900 text-3xl font-bold mb-2 text-center">Quiz Board Game</h1>
          <div className="flex items-center gap-4">
            <p className="text-amber-800/70 text-center text-lg">Current Turn: {players[currentPlayer].name}</p>
            <button onClick={switchTurn} className="bg-white/80 p-2 rounded-lg shadow-lg hover:scale-105 transition">
              <ArrowRightLeft size={20} className="text-amber-800" />
            </button>
          </div>
        </div>

        <div className="bg-white/30 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
          <div className="space-y-4">{renderBoard()}</div>
        </div>

        <div className="fixed bottom-8 right-8">
          <button
            onClick={rollDice}
            disabled={!!currentQuestion || showGradeSelect || isRolling}
            className="bg-white/80 p-4 rounded-lg shadow-lg hover:scale-105 transition disabled:opacity-50"
          >
            <DiceIcon size={70} className={`text-amber-800 ${isRolling ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {showGradeSelect && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white/90 p-8 rounded-lg shadow-2xl">
              <h2 className="text-2xl mb-4 text-amber-900">Select Grade</h2>
              {(['Junior 4', 'Junior 5', 'Junior 6'] as const).map(grade => (
                <button key={grade} onClick={() => selectGrade(grade)} className="block w-full mb-2 p-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition">
                  {grade}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentQuestion && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white/90 p-8 rounded-lg max-w-lg w-full shadow-2xl">
              <h2 className="text-xl mb-4 text-amber-900">{currentQuestion.text}</h2>
              {currentQuestion.options.map((option, index) => (
                <button key={index} onClick={() => answerQuestion(index)} className="block w-full mb-2 p-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition">
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {showCorrectAnswer && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-green-500/90 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg font-semibold">Correct Answer!</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
