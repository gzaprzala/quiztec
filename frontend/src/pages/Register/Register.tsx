import Page from '#components/Page/Page';
import Button from '#components/Button/Button';
import style from './Register.module.scss';
import Input from '#components/Input/Input';
import { Link } from 'react-router-dom';
import { FormEvent, useRef, useState } from 'react';
import MaterialSymbol from '#components/MaterialSymbol/MaterialSymbol';

export default function Register() {
  const [errors, setErrors] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);

  const avatarRef = useRef<HTMLInputElement>(null);
  const loginRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const repeatPasswordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setErrors([]);

    if (loginRef.current === null || emailRef.current === null || passwordRef.current === null || repeatPasswordRef.current === null) {
      return;
    }

    if (passwordRef.current.value !== repeatPasswordRef.current.value) {
      setErrors((prev) => [...prev, 'Passwords do not match']);
      return;
    }

    const form = new FormData();

    form.append('avatar', avatarRef.current?.files?.[0] as Blob);
    form.append('username', loginRef.current.value);
    form.append('email', emailRef.current.value);
    form.append('password', passwordRef.current.value);
    form.append('repeatPassword', repeatPasswordRef.current.value);
      
    const resp = await fetch('/api/v1/auth/register', {
      method: 'POST',
      body: form,
    });

    if (resp.ok) {
      window.location.href = '/login';
    } else {
      const data = await resp.text();
      setErrors(data.split('\n'));
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && file.type.substring(0, 5) === 'image') {
      const reader = new FileReader();
      reader.onload = () => {
        const dataURL = reader.result as string;
        console.log(dataURL);
        setImage(dataURL);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
    }
  };

  return (
    <Page>
      <div className={style.registerContainer}>
        <span className={style.registerText}>JOIN US</span>
        {image === null ? (
          <MaterialSymbol symbol='account_circle' class={style.profileIcon} />
        ) : (
          <img src={image} alt='avatar' className={style.profileAvatar} />
        )}
        <form className={style.registerForm} action="" id="registerform" onSubmit={handleSubmit}>
          <ul className={style.errorContainer}>
            {errors.map((error, index) => (
              <li key={index} className={style.errorText}>
                {error}
              </li>
            ))}
          </ul>
          <Input
            inputRef={avatarRef}
            type='file'
            accept='image/*'
            onChange={handleImageChange}
            required
          />

          <Input
            inputRef={loginRef}
            placeholder="login"
            type="text"
            required
            pattern="[A-Za-z0-9.\-_]+"
            minLength={8}
            maxLength={32}
            title="Allowed characters: A-Z a-z 0-9 . - _"
          />
          <Input inputRef={emailRef} placeholder="email" type="email" required />
          <Input
            inputRef={passwordRef}
            placeholder="password"
            type="password"
            required
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).+"
            minLength={8}
            maxLength={64}
            title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
          />
          <Input
            inputRef={repeatPasswordRef}
            placeholder="repeat password"
            type="password"
            required
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).+"
            minLength={8}
            maxLength={64}
            title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"
          />
          <Button form="registerform" type="submit" className={style.registerButton}>
            SIGN UP
          </Button>
          <Link to="/login">
            <span className={style.registerLink}>Sign in</span>
          </Link>
        </form>
      </div>
    </Page>
  );
}
