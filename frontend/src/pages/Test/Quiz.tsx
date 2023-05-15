import style from './Quiz.module.scss';
import Page from '#components/Page/Page';
import QuizGame from '#components/QuizGame/QuizGame';
import { useEffect, useState } from 'react';
import { Answer, GetQuestionListResponse, Question } from '#shared/types/api/quiz';
import QuizDots from '#components/QuizDots/QuizDots';
import Button from '#components/Button/Button';

const getQuizId = () => {
  const url = new URL(window.location.href);
  return url.pathname.split('/').pop();
};

const fetchQuestions = async () => {
  const id = getQuizId();

  const resp = await fetch(`/api/v1/quiz/${id}/list`);
  const data = (await resp.json()) as GetQuestionListResponse;

  return data.data;
};

const pickRandomQuestions = (questions: Question[], count = 8) => {
  const picked: Question[] = [];
  const indexes: number[] = [];

  while (picked.length < count) {
    const index = Math.floor(Math.random() * questions.length);

    if (!indexes.includes(index)) {
      indexes.push(index);
      picked.push(questions[index]);
    }
  }

  return picked;
};

export default function Quiz() {
  const rounds = 8;

  const [loaded, setLoaded] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [roundCounter, setRoundCounter] = useState<number>(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null | undefined>(undefined);

  useEffect(() => {
    fetchQuestions().then((questions) => {
      setQuestions(pickRandomQuestions(questions));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (selectedAnswer === undefined) return;

    const newAnswers = [...answers];
    newAnswers.push(selectedAnswer !== null && selectedAnswer.correct);
    setAnswers(newAnswers);

    setTimeout(() => {
      if (roundCounter === rounds - 1) {
        setFinished(true);
        return;
      }

      setRoundCounter((prev) => prev + 1);
      setSelectedAnswer(undefined);
    }, 2000);
  }, [selectedAnswer]);

  useEffect(() => {
    console.log(answers);
  }, [answers]);

  return (
    <Page>
      <div className={style.quizContainer}>
        {loaded && !finished && (
          <>
            <QuizDots totalQuestions={rounds} answeredResults={answers} />
            <QuizGame question={questions[roundCounter]} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} time={10} />
          </>
        )}
        {!loaded && <div className={style.loading}>Loading...</div>}
        {finished && (
          <>
            <div className={style.finished}>Quiz Finished!</div>
            <div className={style.finished}>
              Score: {answers.filter((a) => a === true).length} / {rounds}
            </div>
            <Button onClick={() => window.location.reload()}>Play Again</Button>
          </>
        )}
      </div>
    </Page>
  );
}
