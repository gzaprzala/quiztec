import { useState } from "react";
import QuizButton from "../QuizButton/QuizButton";
import TimeBar from "#components/TimeBar/TimeBar";
import styles from "./QuizGame.module.scss";

type Option = {
  label: string;
  isCorrect: boolean;
};

const QuizGame = () => {
  const question = "How many rounds does a single AWP magazine hold?";
  const options: Option[] = [
    { label: "4", isCorrect: false },
    { label: "5", isCorrect: true },
    { label: "8", isCorrect: false },
    { label: "10", isCorrect: false },
  ];

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleAnswerClick = (index: number): void => {
    setSelectedAnswer(index);
  };

  const getVariant = (index: number): "default" | "correct" | "incorrect" => {
    if (selectedAnswer === null) return "default";
    if (options[index].isCorrect) return "correct";
    if (selectedAnswer === index) return "incorrect";
    return "default";
  };

  const handleTimeout = () => {
    console.log("Time is up!");
  };

  return (
    <div className={styles.quizGame}>
      <div className={styles.question}>{question}</div>
      <TimeBar duration={10} onTimeout={handleTimeout} />
      <div className={styles.answers}>
        {options.map((option, index) => (
          <QuizButton
            key={index}
            variant={getVariant(index)}
            onClick={() => handleAnswerClick(index)}
            disabled={selectedAnswer !== null}
          >
            {option.label}
          </QuizButton>
        ))}
      </div>
    </div>
  );
};

export default QuizGame;
