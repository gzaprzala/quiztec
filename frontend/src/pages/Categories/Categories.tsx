import Page from '#components/Page/Page';
import Category, { CategoryProps } from '#components/Category/Category';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { useEffect, useState } from 'react';
import { GetQuizListResponse } from '#types/api/quiz';

import style from './Categories.module.scss';

export default function Categories() {
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3000/api/v1/quiz/list')
      .then((resp) => resp.json() as Promise<GetQuizListResponse>)
      .then((data) => {
        setCategories(data.data);
        setLoading(false);
      });
  }, []);

  return (
    <Page>
      {!loading && (
        <Carousel
          swipeable={true}
          draggable={false}
          keyBoardControl={true}
          containerClass={style.container}
          infinite={true}
          centerMode={true}
          sliderClass={style.slider}
          responsive={{
            alpha: {
              breakpoint: { max: 3000, min: 1920 },
              items: 4,
            },
            beta: {
              breakpoint: { max: 1920, min: 1725 },
              items: 3.5,
            },
            gamma: {
              breakpoint: { max: 1725, min: 1530 },
              items: 3,
            },
            delta: {
              breakpoint: { max: 1530, min: 1335 },
              items: 2.5,
            },
            epsilon: {
              breakpoint: { max: 1335, min: 1140 },
              items: 2,
            },
            zeta: {
              breakpoint: { max: 1140, min: 945 },
              items: 1.5,
            },
            eta: {
              breakpoint: { max: 945, min: 0 },
              items: 1,
            },
          }}
        >
          {categories.map((category, index) => (
            <Category key={index} {...category} />
          ))}
        </Carousel>
      )}
    </Page>
  );
}
