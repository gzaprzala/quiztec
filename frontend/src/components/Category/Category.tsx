import MaterialSymbol from '#components/MaterialSymbol/MaterialSymbol';
import Button from '#components/Button/Button';
import { truncateNumber } from '#shared/numberUtils';

import style from './Category.module.scss';
import { useNavigate } from 'react-router-dom';

interface TagProps {
  name: string;
}

export interface CategoryProps {
  id: string;
  title: string;
  developer: string;
  tags: string[];
  rating: number;
  players: number;
  achievements: number;
  totalAchievements: number;
  author: string;

  backgroundImageUrl: string;
}

function Tag(props: TagProps) {
  return <span className={style.tag}>{props.name}</span>;
}

function Rating(props: { rating: number }) {
  let colorClass = '';
  let symbol = 'sentiment_neutral';

  if (props.rating < 30) {
    colorClass = style.sad;
    symbol = 'sentiment_very_dissatisfied';
  } else if (props.rating > 70) {
    colorClass = style.happy;
    symbol = 'sentiment_very_satisfied';
  }

  return (
    <span className={[style.entry, colorClass].join(' ')}>
      <MaterialSymbol symbol={symbol} class={style.icon} />
      {props.rating}%
    </span>
  );
}

export default function Category(props: CategoryProps) {
  const navigate = useNavigate();

  return (
    <div className={style.container}>
      <div className={style.backgroundImageContainer}>
        <img src={props.backgroundImageUrl} />
      </div>

      <span className={style.developer}>{props.developer}</span>

      <div className={style.group}>
        <span className={style.title}>{props.title}</span>

        <div className={style.tags}>
          {props.tags.map((tag) => (
            <Tag key={tag} name={tag} />
          ))}
        </div>

        <div className={style.info}>
          <Rating rating={props.rating} />
          <span className={style.entry}>
            <MaterialSymbol symbol="group" class={style.icon} />
            {truncateNumber(props.players)}
          </span>
        </div>
      </div>

      <div className={style.group}>
        <span className={style.achievementTitle}>Achievements</span>

        <div className={style.achievementContent}>
          <MaterialSymbol symbol="military_tech" class={style.icon} />
          {props.achievements} of {props.totalAchievements}
        </div>
      </div>

      <Button
        className={style.button}
        onClick={() => {
          navigate(`/quiz/${props.id}`);
        }}
      >
        PLAY
      </Button>

      <div className={style.author}>
        created by
        <span className={style.name}>{props.author}</span>
      </div>
    </div>
  );
}
