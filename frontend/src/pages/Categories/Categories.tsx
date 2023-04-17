import Page from '#components/Page/Page';
import Category, { CategoryProps } from '#components/Category/Category';
import Carousel from 'react-multi-carousel';
import "react-multi-carousel/lib/styles.css";

import style from './Categories.module.scss';
import csgo from '#assets/grids/csgo.webp';
import valorant from '#assets/grids/valorant.webp';
import fortnite from '#assets/grids/fortnite.webp';
import lol from '#assets/grids/lol.webp';


const categories: CategoryProps[] = [
  {
    developer: 'Valve',
    title: 'Counter-Strike: Global Offensive',
    tags: ['FPS', 'Shooter', 'Multiplayer'],
    rating: 72,
    players: 2302,
    achievements: 6,
    totalAchievements: 23,
    author: 'quiztec team',
    backgroundImageUrl: csgo,
  },
  {
    developer: 'Riot Games',
    title: 'Valorant',
    tags: ['FPS', 'Shooter', 'Multiplayer'],
    rating: 22,
    players: 214,
    achievements: 6,
    totalAchievements: 23,
    author: 'quiztec team',
    backgroundImageUrl: valorant,
  }, {
    developer: 'Epics Games',
    title: 'Fortnite',
    tags: ['Battle Royale', 'Shooter', 'Multiplayer'],
    rating: 55,
    players: 112,
    achievements: 6,
    totalAchievements: 23,
    author: 'quiztec team',
    backgroundImageUrl: fortnite,
  },
  {
    developer: 'Riot Games',
    title: 'League of Legends',
    tags: ['MOBA', 'Strategy', 'Multiplayer'],
    rating: 50,
    players: 723,
    achievements: 6,
    totalAchievements: 23,
    author: 'quiztec team',
    backgroundImageUrl: lol,
  }
];

export default function Categories() {
  return (
    <Page>
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
          {categories.map((category, index) => <Category key={index} {...category} />)}
        </Carousel>
    </Page>
  );
}