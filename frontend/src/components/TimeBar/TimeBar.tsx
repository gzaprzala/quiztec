import { useEffect, useRef } from 'react';
import styles from './TimeBar.module.scss';

interface TimeBarProps {
  response: string | null | undefined;
  duration: number;
  onTimeout: () => void;
}

const TimeBar = ({ response, duration, onTimeout }: TimeBarProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.style.setProperty('--quiz-time', `${duration}s`);
    ref.current?.addEventListener('animationend', onTimeout);

    return () => {
      ref.current?.removeEventListener('animationend', onTimeout);
    };
  }, []);

  useEffect(() => {
    if (response !== undefined) {
      ref.current?.classList.remove(styles.animate);
    } else {
      ref.current?.classList.add(styles.animate);
    }
  }, [response]);

  return (
    <div className={styles.timeBar}>
      <div ref={ref} className={styles.innerBar}></div>
    </div>
  );
};

export default TimeBar;
