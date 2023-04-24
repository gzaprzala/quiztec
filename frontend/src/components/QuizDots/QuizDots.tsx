import styles from "./QuizDots.module.scss";

interface QuizDotsProps {
  totalQuestions: number;
  answeredResults: Array<boolean | null>;
}

const QuizDots = ({ totalQuestions, answeredResults }: QuizDotsProps) => {
  const getColor = (index: number) => {
    const result = answeredResults[index];
    if (result === null) return "#CCCCCC";
    return result ? "#C3FF51" : "#FF5555";
  };

  return (
    <div className={styles.questionDots}>
      {Array.from({ length: totalQuestions }, (_, index) => (
        <div
          key={index}
          className={styles.dot}
          style={{ backgroundColor: getColor(index) }}
        ></div>
      ))}
    </div>
  );
};

export default QuizDots;
