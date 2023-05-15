import { useState, useEffect } from "react";
import styles from "./LeadComp.module.scss";

import sample_data from "./sample_data.json";

interface Player {
  id: number;
  profilePicture: string;
  nickname: string;
  value: number;
}

interface LeadCompProps {
  game: string;
  category: string;
}

const games = ["csgo", "valorant", "fortnite", "league_of_legends"];
const categories = [
  "total_correct_answers",
  "total_games",
  "perfect_games",
  "perfect_games_streak",
  "unlocked_achievements",
  "perfect_daily_challenges",
  "perfect_daily_challenges_streak",
];

type GameCategoryDataMapping = {
  [game in (typeof games)[number]]: {
    [category in (typeof categories)[number]]: Player[];
  };
};

const gameCategoryDataMapping = games.reduce<GameCategoryDataMapping>(
  (gameAcc, game) => {
    gameAcc[game] = categories.reduce((categoryAcc, category) => {
      categoryAcc[category] = sample_data;
      return categoryAcc;
    }, {} as { [category in (typeof categories)[number]]: Player[] });
    return gameAcc;
  },
  {} as GameCategoryDataMapping
);

const LeadComp = ({ game, category }: LeadCompProps) => {
  const [leaderboardData, setLeaderboardData] = useState<Player[]>([]);

  useEffect(() => {
    const selectedData: Player[] =
      gameCategoryDataMapping[game]?.[category] ?? [];
    setLeaderboardData(selectedData);
  }, [game, category]);

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.indx}>#</th>
          <th className={styles.profPic}>Profile</th>
          <th className={styles.nickname}>Nickname</th>
          <th className={styles.value}>Value</th>
        </tr>
      </thead>
      <tbody>
        {leaderboardData.map((player, index) => (
          <tr key={player.id}>
            <td className={styles.indx}>{index + 1}</td>
            <td className={styles.profPic}>
              <img
                src={player.profilePicture}
                alt={player.nickname}
                width="50"
                height="50"
                className={styles.img}
              />
            </td>
            <td className={styles.nickname}>{player.nickname}</td>
            <td className={styles.value}>{player.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LeadComp;
