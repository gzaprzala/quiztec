import Page from '#components/Page/Page';
import Button from '#components/Button/Button';
import style from './Home.module.scss';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <Page>
      <div className={style.homeContainer}>
        <div className={style.homeText}>
          <span className={style.homeTextUpper}>
            Are you a true gamer? Take our quizzes and find out!
          </span>
          <span>Join the gaming community and show off your skills</span>
        </div>
        <div className={style.homeButtons}>
          <Link to='/login'>
            <Button className={style.homeButton}>SIGN IN</Button>
          </Link>
          <Link to='register'>
            <Button className={style.homeButton}>SIGN UP</Button>
          </Link>
        </div>
      </div>
    </Page>
  );
}
