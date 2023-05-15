import { useEffect, useRef } from 'react';
import styles from './TimeBar.module.scss';
import { Answer } from '#shared/types/api/quiz';

interface TimeBarProps {
  selectedAnswer: Answer | null | undefined;
  duration: number;
  onTimeout: () => void;
}

const TimeBar = ({ selectedAnswer, duration, onTimeout }: TimeBarProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.style.setProperty('--quiz-time', `${duration}s`);
    ref.current?.addEventListener('animationend', onTimeout);

    return () => {
      ref.current?.removeEventListener('animationend', onTimeout);
    };
  }, []);

  useEffect(() => {
    if (selectedAnswer !== undefined) {
      ref.current?.classList.remove(styles.animate);
    } else {
      ref.current?.classList.add(styles.animate);
    }
  }, [selectedAnswer]);

  return (
    <div className={styles.timeBar}>
      <div ref={ref} className={styles.innerBar}></div>
    </div>
  );
};

export default TimeBar;
