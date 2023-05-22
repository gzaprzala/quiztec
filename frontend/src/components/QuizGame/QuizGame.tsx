import QuizButton from '../QuizButton/QuizButton';
import TimeBar from '#components/TimeBar/TimeBar';
import styles from './QuizGame.module.scss';
import { Answer, Question } from '#shared/types/api/quiz';
import { useEffect } from 'react';

export interface QuizGameProps {
  question: Question<Answer>;
  time: number;
  response: string | null | undefined;
  correctResponse: string | null;
  setResponse: (index: string | null | undefined) => void;
}

const QuizGame = ({ question, time = 10, response, setResponse, correctResponse }: QuizGameProps) => {
  const getVariant = (answer: Answer): 'default' | 'correct' | 'incorrect' => {
    console.log(response, correctResponse);

    if (response === undefined) return 'default';
    if (correctResponse === answer.id) return 'correct';
    if (response === answer.id) return 'incorrect';
    return 'default';
  };

  const handleTimeout = () => {
    setResponse(null);
  };

  useEffect(() => {
    console.log(response);
  }, [response]);

  return (
    <div className={styles.quizGame}>
      <div className={styles.question}>{question.question}</div>
      <TimeBar response={response} duration={time} onTimeout={handleTimeout} />
      <div className={styles.answers}>
        {question.answers.map((option, index) => (
          <QuizButton
            key={index}
            variant={getVariant(option)}
            onClick={() => setResponse(option.id)}
            disabled={response !== null && response !== undefined}
          >
            {option.content}
          </QuizButton>
        ))}
      </div>
    </div>
  );
};

export default QuizGame;
