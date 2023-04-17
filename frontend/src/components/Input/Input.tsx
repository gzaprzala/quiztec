import style from "./Input.module.scss";

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input {...props} className={[style.input, props.className].join(" ")} />
  );
};

export default Input;
