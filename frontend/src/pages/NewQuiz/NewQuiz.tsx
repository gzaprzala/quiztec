import Page from '#components/Page/Page';
import style from './NewQuiz.module.scss';
import Input from '#components/Input/Input';
import Button from '#components/Button/Button';

const NewQuiz = () => {
  return (
    <Page>
      <div className={style.newquizContainer}>
        <span className={style.newquizText}>CREATE NEW QUIZ</span>
        <form className={style.newquizForm} action='' id='newquizform'>
          <Input
            placeholder='Enter question'
            type='text'
            className={style.newquizQuestion}
          />
          <Input
            placeholder='Enter correct answer'
            type='text'
            className={style.newquizCorrect}
          />
          <Input
            placeholder='Enter incorrect answer'
            type='text'
            className={style.newquizFalse}
          />
          <Input
            placeholder='Enter incorrect answer'
            type='text'
            className={style.newquizFalse}
          />
          <Input
            placeholder='Enter incorrect answer'
            type='text'
            className={style.newquizFalse}
          />
          <Button
            form='loginform'
            type='submit'
            className={style.newquizButton}>
            CREATE
          </Button>
        </form>
      </div>
    </Page>
  );
};

export default NewQuiz;
