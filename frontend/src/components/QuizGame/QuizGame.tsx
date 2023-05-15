import QuizButton from '../QuizButton/QuizButton';
import TimeBar from '#components/TimeBar/TimeBar';
import styles from './QuizGame.module.scss';
import { Answer, Question } from '#shared/types/api/quiz';
import { useEffect } from 'react';

export interface QuizGameProps {
  question: Question;
  time: number;
  selectedAnswer: Answer | null | undefined;
  setSelectedAnswer: (index: Answer | null | undefined) => void;
}

const QuizGame = ({ question, time = 10, selectedAnswer, setSelectedAnswer }: QuizGameProps) => {
  const getVariant = (answer: Answer): 'default' | 'correct' | 'incorrect' => {
    if (selectedAnswer === undefined) return 'default';
    if (answer.correct) return 'correct';
    if (selectedAnswer === answer) return 'incorrect';
    return 'default';
  };

  const handleTimeout = () => {
    setSelectedAnswer(null);
  };

  useEffect(() => {
    console.log(selectedAnswer);
  }, [selectedAnswer]);

  return (
    <div className={styles.quizGame}>
      <div className={styles.question}>{question.question}</div>
      <TimeBar selectedAnswer={selectedAnswer} duration={time} onTimeout={handleTimeout} />
      <div className={styles.answers}>
        {question.answers.map((option, index) => (
          <QuizButton
            key={index}
            variant={getVariant(option)}
            onClick={() => setSelectedAnswer(option)}
            disabled={selectedAnswer !== null && selectedAnswer !== undefined}
          >
            {option.content}
          </QuizButton>
        ))}
      </div>
    </div>
  );
};

export default QuizGame;
