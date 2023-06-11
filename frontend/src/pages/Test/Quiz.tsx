import style from './Quiz.module.scss';
import Page from '#components/Page/Page';
import QuizGame from '#components/QuizGame/QuizGame';
import { useEffect, useState } from 'react';
import {
  Answer,
  Game,
  GetGameQuestionResponse,
  PostGameAnswerRequest,
  PostGameAnswerResponse,
  PostGameRatingRequest,
  PostGameStartResponse,
  Question,
} from '#shared/types/api/quiz';
import QuizDots from '#components/QuizDots/QuizDots';
import Button from '#components/Button/Button';
import TemplateButton from '#components/TemplateButton/TemplateButton';
import MaterialSymbol from '#components/MaterialSymbol/MaterialSymbol';

const getQuizId = () => {
  const url = new URL(window.location.href);
  return url.pathname.split('/').pop();
};

const fetchGame = async () => {
  const id = getQuizId();

  const resp = await fetch(`/api/v1/quiz/${id}/start`, {
    method: 'POST',
  });
  const data = (await resp.json()) as PostGameStartResponse;

  return data.data;
};

const fetchQuestion = async (gameId: string) => {
  const resp = await fetch(`/api/v1/quiz/game/${gameId}/question`, {
    method: 'GET',
  });
  const data = (await resp.json()) as GetGameQuestionResponse;

  return data.data;
};

const postAnswer = async (gameId: string, answerId: string) => {
  const body: PostGameAnswerRequest = {
    answerId,
  };

  const resp = await fetch(`/api/v1/quiz/game/${gameId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = (await resp.json()) as PostGameAnswerResponse;

  return data;
};

const postRating = async (quizId: string, rating: boolean) => {
  await fetch(`/api/v1/quiz/${quizId}/rate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      rating,
    } satisfies PostGameRatingRequest),
  });
};

export default function Quiz() {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [game, setGame] = useState<Game>({
    id: '',
    rounds: [],
    rated: true,
    currentQuestion: 0,
    totalQuestions: 0,
    quizId: '',
    userId: null,
  });
  const [question, setQuestion] = useState<Question<Answer>>({
    id: '',
    quizId: '',
    question: '',
    image: null,
    answers: [],
  });
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [response, setResponse] = useState<string | null | undefined>(undefined);
  const [correctResponse, setCorrectResponse] = useState<string | null>(null);
  const [rating, setRating] = useState<boolean | null>(null);

  useEffect(() => {
    fetchGame().then((game) => {
      setGame(game);
      console.log(game);
    });
  }, []);

  useEffect(() => {
    if (game.id === '') return;

    console.log(game.totalQuestions, game.currentQuestion);

    if (game.totalQuestions === game.currentQuestion) {
      setFinished(true);
    } else {
      fetchQuestion(game.id).then((q) => {
        setQuestion(q);
        setLoaded(true);
      });
    }
  }, [game]);

  useEffect(() => {
    if (response === undefined) return;

    postAnswer(game.id, response ?? '').then((g) => {
      setCorrectResponse(g.correctResponse);
      setAnswers([...answers, g.correct]);

      setTimeout(() => {
        setGame(g.data);
        setResponse(undefined);
      }, 2000);
    });
  }, [response]);

  useEffect(() => {
    console.log(answers);
  }, [answers]);

  return (
    <Page>
      <div className={style.quizContainer}>
        {loaded && !finished && (
          <>
            <QuizDots totalQuestions={game.totalQuestions} answeredResults={answers} />
            <QuizGame
              question={question}
              response={response}
              setResponse={setResponse}
              correctResponse={correctResponse}
              image={question.image}
              time={10}
            />
          </>
        )}
        {!loaded && <div className={style.loading}>Loading...</div>}
        {finished && (
          <>
            <div className={style.finished}>Quiz Finished!</div>
            <div className={style.finished}>
              Score: {answers.filter((a) => a === true).length} / {game.totalQuestions}
            </div>
            <Button onClick={() => window.location.reload()}>Play Again</Button>

            {!game.rated && (
              <div className={style.ratingContainer}>
                <span>Rate this game</span>
                <div className={style.ratingButtons}>
                  <TemplateButton
                    onClick={() => {
                      setRating(true);
                      postRating(game.quizId, true);
                    }}
                  >
                    <MaterialSymbol class={[style.thumbsUp, rating === true ? style.rated : ''].join(' ')} symbol="thumb_up" />
                  </TemplateButton>

                  <TemplateButton
                    onClick={() => {
                      setRating(false);
                      postRating(game.quizId, false);
                    }}
                  >
                    <MaterialSymbol class={[style.thumbsDown, rating === false ? style.rated : ''].join(' ')} symbol="thumb_down" />
                  </TemplateButton>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Page>
  );
}
