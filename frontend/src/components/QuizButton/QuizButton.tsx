import React from "react";
import style from "./QuizButton.module.scss";

type QuizButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "correct" | "incorrect";
};

const QuizButton = ({ variant = "default", ...props }: QuizButtonProps) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "correct":
        return style.correct;
      case "incorrect":
        return style.incorrect;
      default:
        return style.default;
    }
  };

  return (
    <button
      {...props}
      className={[style.button, getVariantStyle(), props.className].join(" ")}
    ></button>
  );
};

export default QuizButton;
