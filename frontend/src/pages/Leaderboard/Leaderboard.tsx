import React, { useState } from "react";
import style from "./Leaderboard.module.scss";
import Page from "#components/Page/Page";
import LeadComp from "#components/LeaderboardComponent/LeadComp";

export default function Leaderboard() {
  const [selectedGame, setSelectedGame] = useState("csgo");
  const [selectedCategory, setSelectedCategory] = useState("correct_answers");

  const handleGameButtonClick = (game: string) => {
    setSelectedGame(game);
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <Page>
      <div className={style.leaderboardContainer}>
        <div className={style.pickGame}>
          <button
            className={style.button}
            onClick={() => handleGameButtonClick("csgo")}
          >
            Counter-Strike: Global Offensive
          </button>
          <button
            className={style.button}
            onClick={() => handleGameButtonClick("valorant")}
          >
            Valorant
          </button>
          <button
            className={style.button}
            onClick={() => handleGameButtonClick("fortnite")}
          >
            Fortnite
          </button>
          <button
            className={style.button}
            onClick={() => handleGameButtonClick("league_of_legends")}
          >
            League of Legends
          </button>
        </div>
        <div className={style.leaderboard}>
          <div className={style.dropMenu}>
            <select value={selectedCategory} onChange={handleCategoryChange}>
              <option value="total_correct_answers">
                Number of correct answers
              </option>
              <option value="total_games">Number of games</option>
              <option value="perfect_games">Perfect games</option>
              <option value="perfect_games_streak">
                Streak of perfect games
              </option>
              <option value="unlocked_achievements">
                Unlocked achievements
              </option>
              <option value="perfect_daily_challenges">
                Perfect daily challenges
              </option>
              <option value="perfect_daily_challenges_streak">
                Streak of perfect daily challenges
              </option>
            </select>
          </div>
          <LeadComp game={selectedGame} category={selectedCategory} />
        </div>
      </div>
    </Page>
  );
}
