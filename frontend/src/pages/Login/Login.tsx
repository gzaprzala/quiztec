import Page from '#components/Page/Page';
import Button from '#components/Button/Button';
import style from './Login.module.scss';
import Input from '#components/Input/Input';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <Page>
      <div className={style.loginContainer}>
        <span className={style.loginText}>WELCOME BACK</span>
        <form className={style.loginForm} action='' id='loginform'>
          <Input placeholder='login' />
          <Input placeholder='password' type='password' />
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
