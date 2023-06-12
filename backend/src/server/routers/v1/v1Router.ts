import { Router as expressRouter } from 'express';
import { authRouter } from './auth';
import bodyParser from 'body-parser';
import { quizRouter } from './quiz';
import { mediaRouter } from './media';
import { profileRouter } from './profile';
import { statsRouter } from './stats';
import { leaderboardRouter } from './leaderboard';

export const v1Router = expressRouter();

v1Router.use(bodyParser.json());

v1Router.use('/test', (req, res) =>
  res.json({
    message: 'Test',
    time: new Date(),
  }),
);

v1Router.use('/auth', authRouter());

v1Router.use('/quiz', quizRouter);

v1Router.use('/media', mediaRouter);

v1Router.use('/profile', profileRouter());

v1Router.use('/stats', statsRouter);

v1Router.use('/leaderboard', leaderboardRouter);
