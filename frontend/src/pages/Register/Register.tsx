import Page from '#components/Page/Page';
import Button from '#components/Button/Button';
import style from './Register.module.scss';
import Input from '#components/Input/Input';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <Page>
      <div className={style.registerContainer}>
        <span className={style.registerText}>JOIN US</span>
        <form className={style.registerForm} action='' id='registerform'>
          <Input placeholder='login' />
          <Input placeholder='email' />
          <Input placeholder='password' type='password' />
          <Input placeholder='repeat password' type='password' />
          <Button
            form='registerform'
            type='submit'
            className={style.registerButton}>
            SIGN UP
          </Button>
          <Link to='/login'>
            <span className={style.registerLink}>Sign in</span>
          </Link>
        </form>
      </div>
    </Page>
  );
}
