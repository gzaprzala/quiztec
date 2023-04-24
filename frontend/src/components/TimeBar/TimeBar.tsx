import { useEffect, useState } from "react";
import styles from "./TimeBar.module.scss";

interface TimeBarProps {
  duration: number;
  onTimeout: () => void;
}

const TimeBar = ({ duration, onTimeout }: TimeBarProps) => {
  const [remainingTime, setRemainingTime] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeout]);

  const progress = (remainingTime / duration) * 100;

  return (
    <div className={styles.timeBar}>
      <div className={styles.innerBar} style={{ width: `${progress}%` }}></div>
    </div>
  );
};

export default TimeBar;
