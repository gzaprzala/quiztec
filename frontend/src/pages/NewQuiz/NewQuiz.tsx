import { useState, useRef } from 'react';
import Page from '#components/Page/Page';
import style from './NewQuiz.module.scss';
import Input from '#components/Input/Input';
import Button from '#components/Button/Button';

const categoryOptions = [
  { label: 'CSGO', value: '6461462d32ebca7340170b39' },
  { label: 'LOL', value: '6461462d32ebca7340170b3b' },
  { label: 'Valorant', value: '6461462d32ebca7340170b3a' },
  { label: 'Fortnite', value: '6461462d32ebca7340170b3c' },
];

const NewQuiz = () => {
  const [image, setImage] = useState<string | null>(null);
  const questionRef = useRef<HTMLInputElement>(null);
  const correctRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const incorrectRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!questionRef.current || !correctRef.current) {
      console.error('One or more inputs are missing!');
      return;
    }

    const question = questionRef.current.value;
    const correctAnswer = correctRef.current.value;
    const incorrectAnswers = incorrectRefs.map((ref) =>
      ref.current ? ref.current.value : ''
    );

    const category = categoryOptions.find(
      (option) => option.label === selectedCategory
    );

    if (!category) {
      console.error('Invalid category selection!');
      return;
    }

    const formData = new FormData();
    formData.append('question', question);
    formData.append('active', 'true');
    formData.append('correctAnswer', correctAnswer);
    formData.append('quiz', category.value);
    formData.append('avatar', avatarRef.current?.files?.[0] as Blob);
    incorrectAnswers.forEach((answer) => formData.append('answers', answer));

    console.log(formData);

    try {
      const response = await fetch('/api/v1/quiz/new', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Quiz created!');
      } else {
        console.error('Failed to create quiz');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCategory(e.target.value);
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
      <div className={style.newquizContainer}>
        <span className={style.newquizText}>CREATE NEW QUIZ</span>
        <form className={style.newquizForm} onSubmit={handleSubmit}>
          <Input
            inputRef={questionRef}
            placeholder='Enter question'
            type='text'
            className={style.newquizQuestion}
          />

          <div className={style.newquizCategory}>
            {categoryOptions.map((option) => (
              <label key={option.value}>
                <input
                  type='radio'
                  name='category'
                  value={option.label}
                  checked={selectedCategory === option.label}
                  onChange={handleCategoryChange}
                />
                {option.label}
              </label>
            ))}
          </div>

          <Input
            inputRef={avatarRef}
            type='file'
            accept='image/*'
            onChange={handleImageChange}
            required
          />

          <Input
            inputRef={correctRef}
            placeholder='Enter correct answer'
            type='text'
            className={style.newquizCorrect}
          />
          {incorrectRefs.map((ref, index) => (
            <Input
              key={index}
              inputRef={ref}
              placeholder='Enter incorrect answer'
              type='text'
              className={style.newquizFalse}
            />
          ))}
          <Button type='submit' className={style.newquizButton}>
            CREATE
          </Button>
        </form>
      </div>
    </Page>
  );
};

export default NewQuiz;
