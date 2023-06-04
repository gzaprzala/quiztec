import { useState, useEffect } from "react";
import styles from "./Statistics.module.scss";
import { StatisticsData } from "#shared/types/api/stats";

interface StatisticsProps {
  game: string;
}

const Statistics = ({ game }: StatisticsProps) => {
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(
    null
  );

  useEffect(() => {
    fetchStatistics();

    async function fetchStatistics() {
      try {
        const response = await fetch(`/api/v1/stats/${game}`);
        const data = await response.json();
        setStatisticsData(data);
      } catch (error) {
        console.error(error);
      }
    }
  }, [game]);

  if (statisticsData === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.statisticsContainer}>
      {statisticsData && (
        <>
          <div className={styles.stat}>
            <div className={styles.statName}>Total Correct Answers</div>
            <div className={styles.statValue}>
              {statisticsData.total_correct_answers}
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statName}>Total Games</div>
            <div className={styles.statValue}>{statisticsData.total_games}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statName}>Perfect Games</div>
            <div className={styles.statValue}>
              {statisticsData.perfect_games}
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statName}>Perfect Games Streak</div>
            <div className={styles.statValue}>
              {statisticsData.perfect_games_streak}
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statName}>Unlocked Achievements</div>
            <div className={styles.statValue}>
              {statisticsData.unlocked_achievements}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Statistics;
