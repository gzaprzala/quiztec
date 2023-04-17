import style from "./Button.module.scss";

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={[style.button, props.className].join(" ")}
    ></button>
  );
};

export default Button;
