import style from "./Quiz.module.scss";
import Page from "#components/Page/Page";
import QuizGame from "#components/QuizGame/QuizGame";

export default function Quiz() {
  return (
    <Page>
      <div className={style.quizContainer}>
        <QuizGame />
      </div>
    </Page>
  );
}
