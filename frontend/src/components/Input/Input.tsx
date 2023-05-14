import { InputHTMLAttributes, MutableRefObject } from 'react';
import style from './Input.module.scss';

const Input = (
  props: InputHTMLAttributes<HTMLInputElement> & {
    inputRef?: MutableRefObject<HTMLInputElement | null>;
  }
) => {
  const { inputRef, ...rest } = props;

  return (
    <input
      ref={inputRef}
      {...rest}
      className={[style.input, props.className].join(' ')}
    />
  );
};

export default Input;
