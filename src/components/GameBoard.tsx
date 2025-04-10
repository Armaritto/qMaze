import React, { useState, useEffect } from 'react';
import { Player, Question, Box } from '../types';
import { 
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6,
  CheckCircle
} from 'lucide-react';

const DICE_FACES = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

const GRID_LAYOUT = [
  [15, 16, 17, 18, 19, 20],
  [14, -1, -1, -1, -1, -1],
  [13, 12, 11, 10, 9, 8],
  [-1, -1, -1, -1, -1, 7],
  [1, 2, 3, 4, 5, 6],
];

const BOXES: Box[] = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));

const SAMPLE_QUESTIONS: Question[] = [
  {
    "id": 1,
    "text": "What is 2 + 2?",
    "options": ["3", "4", "5"],
    "correctAnswer": 1,
    "grade": "Junior 4"
  },
  {
    "id": 2,
    "text": "What is 5 x 3?",
    "options": ["15", "10", "20"],
    "correctAnswer": 0,
    "grade": "Junior 5"
  },
  {
    "id": 3,
    "text": "Which planet is known as the Red Planet?",
    "options": ["Earth", "Mars", "Venus"],
    "correctAnswer": 1,
    "grade": "Junior 6"
  },
  {
    "id": 4,
    "text": "What is the capital of Egypt?",
    "options": ["Cairo", "Alexandria", "Giza"],
    "correctAnswer": 0,
    "grade": "Junior 4"
  },
  {
    "id": 5,
    "text": "How many legs does a spider have?",
    "options": ["6", "8", "10"],
    "correctAnswer": 1,
    "grade": "Junior 5"
  },
  {
    "id": 6,
    "text": "What is 12 divided by 4?",
    "options": ["2", "3", "4"],
    "correctAnswer": 1,
    "grade": "Junior 6"
  },
  {
    "id": 7,
    "text": "Which animal is known as the king of the jungle?",
    "options": ["Tiger", "Elephant", "Lion"],
    "correctAnswer": 2,
    "grade": "Junior 4"
  },
  {
    "id": 8,
    "text": "What is 9 - 6?",
    "options": ["1", "3", "6"],
    "correctAnswer": 1,
    "grade": "Junior 5"
  },
  {
    "id": 9,
    "text": "How many days are there in a week?",
    "options": ["5", "7", "10"],
    "correctAnswer": 1,
    "grade": "Junior 6"
  },
  {
    "id": 10,
    "text": "What color do you get when you mix red and yellow?",
    "options": ["Orange", "Green", "Purple"],
    "correctAnswer": 0,
    "grade": "Junior 4"
  },
  {
    "id": 11,
    "text": "What is 7 + 5?",
    "options": ["13", "12", "11"],
    "correctAnswer": 1,
    "grade": "Junior 5"
  },
  {
    "id": 12,
    "text": "Which is the largest mammal?",
    "options": ["Elephant", "Blue Whale", "Giraffe"],
    "correctAnswer": 1,
    "grade": "Junior 6"
  },
  {
    "id": 13,
    "text": "How many hours are in one day?",
    "options": ["12", "24", "36"],
    "correctAnswer": 1,
    "grade": "Junior 4"
  },
  {
    "id": 14,
    "text": "What is 10 - 3?",
    "options": ["7", "6", "8"],
    "correctAnswer": 0,
    "grade": "Junior 5"
  },
  {
    "id": 15,
    "text": "Which shape has 4 equal sides?",
    "options": ["Triangle", "Square", "Rectangle"],
    "correctAnswer": 1,
    "grade": "Junior 6"
  },
  {
    "id": 16,
    "text": "What do bees make?",
    "options": ["Milk", "Honey", "Silk"],
    "correctAnswer": 1,
    "grade": "Junior 4"
  },
  {
    "id": 17,
    "text": "What comes after Tuesday?",
    "options": ["Monday", "Wednesday", "Thursday"],
    "correctAnswer": 1,
    "grade": "Junior 5"
  },
  {
    "id": 18,
    "text": "Which of these is not a fruit?",
    "options": ["Apple", "Banana", "Carrot"],
    "correctAnswer": 2,
    "grade": "Junior 6"
  },
  {
    "id": 19,
    "text": "Which sense do we use with our nose?",
    "options": ["Hearing", "Smell", "Taste"],
    "correctAnswer": 1,
    "grade": "Junior 4"
  },
  {
    "id": 20,
    "text": "How many months are there in a year?",
    "options": ["10", "12", "14"],
    "correctAnswer": 1,
    "grade": "Junior 5"
  },
  {
    "id": 21,
    "text": "What is 2 + 2?",
    "options": ["3", "4", "5"],
    "correctAnswer": 1,
    "grade": "Junior 6"
  },
];

const INITIAL_PLAYERS: Player[] = [
  { id: 1, color: '#006884', position: 1, name: 'Boys' },
  { id: 2, color: '#FC6C85', position: 1, name: 'Girls' }
];

export function GameBoard() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [currentPlayer, setCurrentPlayer] = useState<number>(1);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [showGradeSelect, setShowGradeSelect] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [highlightBox, setHighlightBox] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [isRolling, setIsRolling] = useState(false);
  const [currentDiceFace, setCurrentDiceFace] = useState(0);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [animatingBoxes, setAnimatingBoxes] = useState<number[]>([]);

  useEffect(() => {
    let interval: number;
    if (isRolling) {
      interval = setInterval(() => {
        setCurrentDiceFace(prev => (prev + 1) % 6);
      }, 100);

      setTimeout(() => {
        setIsRolling(false);
        clearInterval(interval);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRolling]);

  const rollDice = () => {
    setIsRolling(true);
    const roll = 1 //Math.floor(Math.random() * 6) + 1;
    
    setTimeout(() => {
      setDiceRoll(roll);
      setCurrentDiceFace(roll - 1);
      console.log('Dice rolled1:', currentDiceFace);
      
      // Calculate path to target
      const currentPos = players[currentPlayer].position;
      const targetPos = Math.min(currentPos + roll, BOXES.length);
      const path = Array.from(
        { length: targetPos - currentPos + 1 },
        (_, i) => currentPos + i
      );
      
      // Animate through path
      let delay = 0;
      let total_delay = 3000;
      let animation_delay = total_delay / path.length;
      path.forEach((pos, index) => {
        setTimeout(() => {
          setHighlightBox(pos);
        }, delay);
        delay += animation_delay; 
      });
      console.log('Dice rolled2:', currentDiceFace);
      setTimeout(() => {
        setShowGradeSelect(true);
      }, delay + 200);
    }, 1000);
  };

  const selectGrade = (grade: Question['grade']) => {
    const availableQuestions = SAMPLE_QUESTIONS.filter(
      q => q.grade === grade && !answeredQuestions.has(q.id)
    );
    if (availableQuestions.length > 0) {
      const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
      setCurrentQuestion(randomQuestion);
    }
    setShowGradeSelect(false);
  };

  const animatePlayerMovement = (start: number, end: number) => {
    const path = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
    
    let delay = 0;
    path.forEach((position, index) => {
      setTimeout(() => {
        setPlayers(prev => prev.map(p => 
          p.id === players[currentPlayer].id
            ? { ...p, position }
            : p
        ));
        setAnimatingBoxes(prev => [...prev, position]);
        
        // Remove animation class after it completes
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
      // First zoom out the question modal
      setCurrentQuestion(null);
      
      // Show correct answer popup
      setTimeout(() => {
        setShowCorrectAnswer(true);
        
        // Hide correct answer popup
        setTimeout(() => {
          setShowCorrectAnswer(false);
          
          // Start player movement animation
          const startPos = players[currentPlayer].position;
          const targetPos = Math.min(startPos + diceRoll, BOXES.length);
          
          const animationDuration = animatePlayerMovement(startPos, targetPos);
          
          // After all animations complete
          setTimeout(() => {
            setCurrentPlayer((currentPlayer + 1) % players.length);
            setDiceRoll(null);
            setHighlightBox(null);
            setIsMoving(false);
          }, animationDuration + 200);
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
          if (boxNumber === -1) {
            return <div key={`${rowIndex}-${colIndex}`} className="w-20 h-20" />;
          }

          const playersInBox = players.filter(player => player.position === boxNumber);
          const isHighlighted = highlightBox === boxNumber;
          const isAnimating = animatingBoxes.includes(boxNumber);
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                w-20 h-20 bg-white rounded-lg shadow-lg relative
                transition-all duration-300 ease-in-out
                ${isHighlighted ? 'ring-4 ring-red-500 ring-opacity-50 transform scale-105' : ''}
                flex items-center justify-center
                ${boxNumber === 1 ? 'bg-green-100' : ''}
                ${boxNumber === 20 ? 'bg-blue-100' : ''}
              `}
            >
              <span className="absolute top-2 left-2 text-sm text-gray-500">{boxNumber}</span>
              <div className="flex gap-2">
                {playersInBox.map(player => (
                  <div
                    key={player.id}
                    className={`
                      w-6 h-6 rounded-full
                      transition-all duration-300
                      ${isAnimating ? 'animate-bounce transform scale-110' : ''}
                    `}
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
    <div className="min-h-screen bg-gray-900 p-8 flex flex-col items-center justify-center">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold mb-2">Quiz Board Game</h1>
        <p className="text-gray-400">Current Turn: {players[currentPlayer].name}</p>
      </div>

      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
        <div className="space-y-4">
          {renderBoard()}
        </div>
      </div>

      <div className="fixed bottom-8 right-8">
        <button
          onClick={rollDice}
          disabled={!!currentQuestion || showGradeSelect || isRolling}
          className="bg-white p-4 rounded-lg shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <DiceIcon size={70} className={isRolling ? 'animate-spin' : ''} />
          {diceRoll && !isRolling && <span className="ml-2">{diceRoll}</span>}
        </button>
      </div>

      {showGradeSelect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg transform transition-all duration-300 scale-100 opacity-100">
            <h2 className="text-2xl mb-4">Select Grade</h2>
            {(['Junior 4', 'Junior 5', 'Junior 6'] as const).map(grade => (
              <button
                key={grade}
                onClick={() => selectGrade(grade)}
                className="block w-full mb-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {grade}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-lg w-full transform transition-all duration-300 scale-100 opacity-100">
            <h2 className="text-xl mb-4">{currentQuestion.text}</h2>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => answerQuestion(index)}
                className="block w-full mb-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCorrectAnswer && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-2 transform animate-bounce">
            <CheckCircle className="w-6 h-6" />
            <span className="text-lg font-semibold">Correct Answer!</span>
          </div>
        </div>
      )}
    </div>
  );
}