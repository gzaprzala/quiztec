import React, { useState, useRef, useEffect } from 'react';
import Page from '#components/Page/Page';
import style from './NewQuiz.module.scss';
import Input from '#components/Input/Input';
import Button from '#components/Button/Button';
import { GetQuizListResponse } from '#shared/types/api/quiz';
import Category, { CategoryProps } from '#components/Category/Category';
import { useSession } from '#providers/SessionProvider';
import { Role } from '#shared/types/api/auth';

const NewQuiz = () => {
  const [session] = useSession();
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [image, setImage] = useState<string | null>(null);
  const questionRef = useRef<HTMLInputElement>(null);
  const correctRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const incorrectRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quizCreated, setQuizCreated] = useState(false); // New state for quiz creation status

  useEffect(() => {
    if (session.user === undefined || !session.user.roles.includes(Role.ADMIN)) {
      location.href = '/login';
    }

    setLoading(true);
    fetch('/api/v1/quiz/list')
      .then((resp) => resp.json() as Promise<GetQuizListResponse>)
      .then((data) => {
        setCategories(data.data);
        setLoading(false);
      });
  }, []);

  const categoryOptions = categories.map((category) => ({
    label: category.title,
    value: category.id,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!questionRef.current || !correctRef.current) {
      console.error('One or more inputs are missing!');
      return;
    }

    const question = questionRef.current.value;
    const correctAnswer = correctRef.current.value;
    const incorrectAnswers = incorrectRefs.map((ref) => (ref.current ? ref.current.value : ''));

    const category = categoryOptions.find((option) => option.label === selectedCategory);

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

    try {
      const response = await fetch('/api/v1/quiz/new', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Quiz created!');
        setQuizCreated(true);

        questionRef.current.value = '';
        correctRef.current.value = '';
        incorrectRefs.forEach((ref) => {
          if (ref.current) {
            ref.current.value = '';
          }
        });

        setSelectedCategory('');
        setImage(null);
        if (avatarRef.current) {
          avatarRef.current.value = '';
        }
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
          <Input inputRef={questionRef} placeholder="Enter question" type="text" className={style.newquizQuestion} />

          <div className={style.newquizCategory}>
            {categoryOptions.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="category"
                  value={option.label}
                  checked={selectedCategory === option.label}
                  onChange={handleCategoryChange}
                />
                {option.label}
              </label>
            ))}
          </div>

          <Input inputRef={avatarRef} type="file" accept="image/*" onChange={handleImageChange} required />

          <Input inputRef={correctRef} placeholder="Enter correct answer" type="text" className={style.newquizCorrect} />
          {incorrectRefs.map((ref, index) => (
            <Input key={index} inputRef={ref} placeholder="Enter incorrect answer" type="text" className={style.newquizFalse} />
          ))}
          <Button type="submit" className={style.newquizButton}>
            CREATE
          </Button>
        </form>
        {quizCreated && <div className={style.successMessage}>Quiz created successfully!</div>}
      </div>
    </Page>
  );
};

export default NewQuiz;
