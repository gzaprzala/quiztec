import React, { useState, useEffect, useCallback } from "react";
import style from "./Leaderboard.module.scss";
import Page from "#components/Page/Page";
import LeadComp from "#components/LeaderboardComponent/LeadComp";
import { GetQuizListResponse } from "#types/api/quiz";
import { CategoryProps } from "#components/Category/Category";

const API_URL = "http://localhost:3000/api/v1/quiz/list";
const GAMES = [
  "Counter-Strike: Global Offensive",
  "Valorant",
  "Fortnite",
  "League of Legends",
];

export default function Leaderboard() {
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
  const [selectedCategory, setSelectedCategory] = useState(
    "total_correct_answers"
  );

  useEffect(() => {
    fetch(API_URL)
      .then((resp) => resp.json() as Promise<GetQuizListResponse>)
      .then((data) => {
        setCategories(data.data);
        setLoading(false);
      })
      .catch((error) => console.error("Failed to fetch data: ", error));
  }, []);

  const getGameId = useCallback(
    (game: string) => {
      const category = categories.find((category) => category.title === game);
      return category ? category.id : "";
    },
    [categories]
  );

  useEffect(() => {
    setSelectedGame(getGameId(GAMES[0]));
  }, [getGameId]);

  const handleGameButtonClick = (game: string) => {
    setSelectedGame(getGameId(game));
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <Page>
      {!loading && (
        <div className={style.leaderboardContainer}>
          <div className={style.pickGame}>
            <button
              className={
                style.button +
                " " +
                style.csgo +
                " " +
                (selectedGame === getGameId(GAMES[0]) ? " " + style.active : "")
              }
              onClick={() => handleGameButtonClick(GAMES[0])}
            >
              Counter-Strike: Global Offensive
            </button>
            <button
              className={
                style.button +
                " " +
                style.valorant +
                " " +
                (selectedGame === getGameId(GAMES[1]) ? " " + style.active : "")
              }
              onClick={() => handleGameButtonClick(GAMES[1])}
            >
              Valorant
            </button>
            <button
              className={
                style.button +
                " " +
                style.fortnite +
                " " +
                (selectedGame === getGameId(GAMES[2]) ? " " + style.active : "")
              }
              onClick={() => handleGameButtonClick(GAMES[2])}
            >
              Fortnite
            </button>
            <button
              className={
                style.button +
                " " +
                style.league +
                " " +
                (selectedGame === getGameId(GAMES[3]) ? " " + style.active : "")
              }
              onClick={() => handleGameButtonClick(GAMES[3])}
            >
              League of Legends
            </button>
          </div>
          <div className={style.wrap}>
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
              </select>
            </div>
            <LeadComp game={selectedGame} category={selectedCategory} />
          </div>
        </div>
      )}
    </Page>
  );
}
