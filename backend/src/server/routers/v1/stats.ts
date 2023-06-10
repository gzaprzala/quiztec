import { Router as expressRouter } from 'express';
import { StatisticsData } from '#shared/types/api/stats';
import { User } from '#database/entities/User';

export const statsRouter = expressRouter();

statsRouter.get('/:game', async (req, res) => {
  try {
    const game = req.params.game;

    if (!req.user || !req.user._id) {
      res.sendStatus(401);
      return;
    }

    const user = await User.getById(req.user._id.toHexString());

    if (!user) {
      res.sendStatus(404);
      return;
    }

    const playedQuizzes = user.playedQuizzes;

    const gameQuizzes = playedQuizzes.filter((quiz) => quiz.quizId.toHexString() === game);

    const total_games = gameQuizzes.length;

    let total_correct_answers = 0;
    let perfect_games = 0;
    let perfect_games_streak = 0;
    let current_streak = 0;

    for (const quiz of gameQuizzes) {
      total_correct_answers += quiz.points;

      if (quiz.points === quiz.rounds.length) {
        perfect_games++;
        current_streak++;
        perfect_games_streak = Math.max(perfect_games_streak, current_streak);
      } else {
        current_streak = 0;
      }
    }

    const statisticsData: StatisticsData = {
      total_correct_answers: total_correct_answers,
      total_games: total_games,
      perfect_games: perfect_games,
      perfect_games_streak: perfect_games_streak,
      unlocked_achievements: user.achievements.filter((achievement) => achievement.gameId?.toHexString() === game).length,
    };

    res.json(statisticsData);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
