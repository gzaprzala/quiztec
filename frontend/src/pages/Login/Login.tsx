import Page from '#components/Page/Page';
import Button from '#components/Button/Button';
import style from './Login.module.scss';
import Input from '#components/Input/Input';
import { Link } from 'react-router-dom';
import { FormEvent, useRef, useState } from 'react';

export default function Login() {
  const [errors, setErrors] = useState<string[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setErrors([]);

    if (emailRef.current === null || passwordRef.current === null) {
      return;
    }

    const credentials = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };

    const resp = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (resp.ok) {
      window.location.href = '/';
      console.log(resp);
    } else {
      setErrors(['Incorrect email or password.']);
    }
  };

  return (
    <Page>
      <div className={style.loginContainer}>
        <span className={style.loginText}>WELCOME BACK</span>
        <ul className={style.errorContainer}>
          {errors.map((error, index) => (
            <li key={index} className={style.errorText}>
              {error}
            </li>
          ))}
        </ul>
        <form
          className={style.loginForm}
          action=''
          id='loginform'
          onSubmit={handleSubmit}>
          <Input
            inputRef={emailRef}
            placeholder='email'
            type='email'
            required
          />
          <Input
            inputRef={passwordRef}
            placeholder='password'
            type='password'
            required
          />
          <Button form='loginform' type='submit' className={style.loginButton}>
            SIGN IN
          </Button>
          <Link to='/register'>
            <span className={style.loginLink}>Sign up</span>
          </Link>
        </form>
      </div>
    </Page>
  );
}
