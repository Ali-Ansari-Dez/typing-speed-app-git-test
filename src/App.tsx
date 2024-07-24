import React, { useState, useEffect } from 'react';
import './App.css';
import commonWords from './commonwords.json';

const shuffleArray = (array: string[]): string[] => {
  let currentIndex = array.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex],
    ];
  }
  return array;
};

type WordStatus = {
  [key: number]: boolean | null;
}

type WordListProps = {
  displayedWords: string[];
  wordStatus: WordStatus;
  currentIndex: number;
  startIndex: number;
};

const WordList = ({ displayedWords, wordStatus, currentIndex, startIndex }: WordListProps) => {
  return (
    <div className="typingParagraph">
      {displayedWords.map((word, index) => {
        const globalIndex = startIndex + index;
        let className = '';
        if (wordStatus[globalIndex] === true) {
          className = 'correct';
        } else if (wordStatus[globalIndex] === false) {
          className = 'incorrect';
        } else if (globalIndex === currentIndex) {
          className = 'current';
        }
        return (
          <span key={globalIndex} className={className}>{word} </span>
        );
      })}
    </div>
  );
};


type TypingInputProps = {
  inputValue: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  timeLeft: number;
  handleRetry: () => void;
  isDisabled: boolean;
};

const TypingInput = ({ inputValue, handleInputChange, timeLeft, handleRetry, isDisabled }: TypingInputProps) => {
  return (
    <div className="inputTimerRefresh">
      <input type="text" value={inputValue} onChange={handleInputChange} disabled={isDisabled} />
      <p>Time Left: {timeLeft}</p>
      <button className="retryButton" onClick={handleRetry}>Try Again</button>
    </div>
  );
};

type StatsProps = {
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
};

const Stats = ({ wpm, accuracy, correctWords, incorrectWords }: StatsProps) => {
  return (
    <div className="stats">
      <p className='title'>Results:</p>
      <p className='wpm'>WPM: {wpm}</p>
      <p className='accuracy'>Accuracy: {accuracy.toFixed(2)}%</p>
      <p className='correctWords'>Correct Words: {correctWords}</p>
      <p className='incorrectWords'>Incorrect Words: {incorrectWords}</p>
    </div>
  );
};

const App = () => {
  const maxTime = 60; 
  const wordsPerLine = 13;
  const [timeLeft, setTimeLeft] = useState(maxTime);
  const [inputValue, setInputValue] = useState('');
  const [wordList, setWordList] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [correctWords, setCorrectWords] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [wordStatus, setWordStatus] = useState<WordStatus>({});

  useEffect(() => {
    const shuffledWords = shuffleArray([...commonWords.commonWords]);
    setWordList(shuffledWords);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isTyping && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
      }, 1000);
    } 
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTyping, timeLeft]);

  const checkWord = (trimmedValue: string) => {
    const isCorrect = trimmedValue === wordList[currentIndex];
    setWordStatus(prevStatus => ({
      ...prevStatus,
      [currentIndex]: isCorrect,
    }));
    setTotalWords(prevTotalWords => prevTotalWords + 1);
    if (isCorrect) setCorrectWords(prevCorrectWords => prevCorrectWords + 1);
    setCurrentIndex(prevCurrentIndex => prevCurrentIndex + 1);
  };

  const handleSpace = (value: string) => {
    const trimmedValue = value.trim();
    checkWord(trimmedValue);
    setInputValue('');
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
      setIsTyping(true);
      if (value.endsWith(' ')) {
        handleSpace(value);
    }
  };

  const handleRetry = () => {
    setTimeLeft(maxTime);
    setInputValue('');
    setCurrentIndex(0);
    setIsTyping(false);
    setCorrectWords(0);
    setTotalWords(0);
    setWordStatus({});
    const shuffledWords = shuffleArray([...commonWords.commonWords]);
    setWordList(shuffledWords);
  };

  const startIndex = Math.floor(currentIndex / wordsPerLine) * wordsPerLine;
  const displayedWords = wordList.slice(startIndex, startIndex + wordsPerLine * 2);
  const wpm = correctWords * (60 / maxTime);
  const accuracy = totalWords > 0 ? (correctWords / totalWords) * 100 : 0;
  const incorrectWords = totalWords - correctWords;
  const isTimeUp = timeLeft <= 0;

  return (
    <div className="App">
      <WordList
        displayedWords={displayedWords}
        wordStatus={wordStatus}
        currentIndex={currentIndex}
        startIndex={startIndex}
      />
      <TypingInput
        inputValue={inputValue}
        handleInputChange={handleInputChange}
        timeLeft={timeLeft}
        handleRetry={handleRetry}
        isDisabled={isTimeUp}
      />
      {isTimeUp && (
        <Stats
          wpm={wpm}
          accuracy={accuracy}
          correctWords={correctWords}
          incorrectWords={incorrectWords}
        />
      )}
    </div>
  );
}

export default App;


