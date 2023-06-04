import { Router as expressRouter } from "express";
import { Database } from "#database/Database";
import { User } from "#database/entities/User";

export const leaderboardRouter = expressRouter();

leaderboardRouter.get("/:game/:filter", async (req, res) => {
  try {
    const { game, filter } = req.params;

    const userRepository = await Database.getRepository(User);
    const users = await userRepository.find();

    const leaderboard = users.map((user) => {
      const playedGameQuizzes = user.playedQuizzes.filter(
        (quiz) => quiz.quizId.toHexString() === game
      );

      let filterValue = 0;
      switch (filter) {
        case "total_games":
          filterValue = playedGameQuizzes.length;
          break;
        case "total_correct_answers":
          filterValue = playedGameQuizzes.reduce(
            (acc, quiz) => acc + quiz.points,
            0
          );
          break;
        case "perfect_games":
          filterValue = playedGameQuizzes.filter(
            (quiz) => quiz.points === quiz.rounds.length
          ).length;
          break;
        case "perfect_games_streak":
          let currentStreak = 0;
          let maxStreak = 0;
          for (const quiz of playedGameQuizzes) {
            if (quiz.points === quiz.rounds.length) {
              currentStreak++;
              maxStreak = Math.max(maxStreak, currentStreak);
            } else {
              currentStreak = 0;
            }
          }
          filterValue = maxStreak;
          break;
      }

      return {
        userId: user._id.toHexString(),
        profilePicture: user.image,
        nickname: user.username,
        filterValue,
      };
    });

    leaderboard.sort((a, b) => b.filterValue - a.filterValue);

    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
