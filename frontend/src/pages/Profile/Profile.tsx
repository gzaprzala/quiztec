import Page from '#components/Page/Page';
import { FormEvent, useRef, useState } from 'react';
import style from './Profile.module.scss';
import MaterialSymbol from '#components/MaterialSymbol/MaterialSymbol';
import Input from '#components/Input/Input';
import Button from '#components/Button/Button';
import { useSession } from '#providers/SessionProvider';

const Profile = () => {
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [session] = useSession();

  const avatarRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const repeatPasswordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    console.log('111');
    ev.preventDefault();
    setErrors([]);

    if (
      emailRef.current === null ||
      passwordRef.current === null ||
      repeatPasswordRef.current === null
    ) {
      return;
    }

    if (passwordRef.current.value !== repeatPasswordRef.current.value) {
      setErrors((prev) => [...prev, 'Passwords do not match']);
      return;
    }

    const form = new FormData();

    form.append('avatar', avatarRef.current?.files?.[0] as Blob);
    form.append('username', session.user?.username ?? '');
    form.append('email', emailRef.current.value);
    form.append('password', passwordRef.current.value);
    form.append('repeatPassword', repeatPasswordRef.current.value);

    const resp = await fetch('/api/v1/profile/update', {
      method: 'POST',
      body: form,
    });

    if (resp.ok) {
      window.location.href = '/';
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
        setImage(dataURL);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
    }
  };

  return (
    <Page>
      <div className={style.profileContainer}>
        <span className={style.profileText}>EDIT PROFILE</span>
        {image === null ? (
          <MaterialSymbol symbol='account_circle' class={style.profileIcon} />
        ) : (
          <img src={image} alt='avatar' className={style.profileAvatar} />
        )}
        <form
          className={style.profileForm}
          action=''
          id='profileform'
          onSubmit={handleSubmit}>
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
            inputRef={emailRef}
            placeholder='new email'
            type='email'
            required
          />
          <Input
            inputRef={passwordRef}
            placeholder='new password'
            type='password'
            required
            pattern='(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).+'
            minLength={8}
            maxLength={64}
            title='Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters'
          />
          <Input
            inputRef={repeatPasswordRef}
            placeholder='repeat new password'
            type='password'
            required
            pattern='(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).+'
            minLength={8}
            maxLength={64}
            title='Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters'
          />
          <Button
            form='profileform'
            type='submit'
            className={style.profileButton}>
            SUBMIT
          </Button>
        </form>
      </div>
    </Page>
  );
};

export default Profile;
