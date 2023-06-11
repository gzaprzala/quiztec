import { Router as expressRouter } from 'express';
import { Database } from '#database/Database';
import { Quiz, Rating } from '#database/entities/Quiz';
import {
  GetGameQuestionResponse,
  GetQuestionListResponse,
  GetQuizListResponse,
  PostGameAnswerResponse,
  PostGameStartResponse,
} from '#types/api/quiz';
import { Question } from '#database/entities/Question';
import { ObjectId } from 'mongodb';
import { BSONError } from 'bson';
import { ActiveQuiz } from '#database/entities/ActiveQuiz';
import multer from 'multer';
import { randomUUID } from 'crypto';
import mime from 'mime';
import { Media } from '#database/entities/Media';
import { Achievement } from '#database/entities/Achievement';
import { User } from '#database/entities/User';

export const quizRouter = expressRouter();

const getUnlockedAchievements = (user: User | undefined, gameId: string): number => {
  if (user === undefined) return 0;
  return user.achievements.filter((achievement) => achievement.gameId?.toHexString() === gameId).length;
};

const getRating = (quiz: Quiz): number => {
  if (quiz.ratings.length === 0) return 0;

  const positive = quiz.ratings.filter((rating) => rating.rating).length;

  return (positive / quiz.ratings.length) * 100;
};

quizRouter.get('/list', async (req, res) => {
  try {
    const quizRepo = await Database.getRepository(Quiz);
    const quizzes = await quizRepo.find();
    const resp: GetQuizListResponse = {
      data: [],
    };

    for (const quiz of quizzes) {
      const achievements = await Achievement.getByGameId(quiz._id);

      resp.data.push({
        id: quiz._id.toHexString(),
        title: quiz.title,
        developer: quiz.developer,
        tags: quiz.tags,
        rating: getRating(quiz),
        players: quiz.visitedPlayers.length,
        achievements: getUnlockedAchievements(req.user, quiz._id.toHexString()),
        totalAchievements: achievements.length,
        author: quiz.author,
        backgroundImageUrl: quiz.backgroundImage,
      });
    }

    res.json(resp);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

quizRouter.get('/:id/list', async (req, res) => {
  try {
    const questionRepo = await Database.getRepository(Question);
    const questions = await questionRepo.find({
      where: {
        quiz: ObjectId.createFromHexString(req.params.id),
      },
    });

    if (questions.length === 0) return res.sendStatus(404);

    const resp: GetQuestionListResponse = {
      data: questions.map((question) => ({
        id: question._id.toHexString(),
        quizId: question.quiz.toHexString(),
        question: question.question,
        image: question.image,
        answers: question.answers.map((answer) => ({
          id: answer.id.toHexString(),
          content: answer.content,
          correct: answer.correct,
        })),
      })),
    };

    res.json(resp);
  } catch (err) {
    if (err instanceof BSONError) return res.sendStatus(400);
    else {
      console.error(err);
      res.sendStatus(500);
    }
  }
});

quizRouter.post('/:id/rate', async (req, res) => {
  try {
    if (req.isUnauthenticated()) return res.sendStatus(200);
    if (req.user === undefined) return res.sendStatus(200);

    const quiz = await Quiz.getById(req.params.id);
    if (quiz === null) return res.sendStatus(404);

    if ('rating' in req.body === false || typeof req.body.rating !== 'boolean' || req.body.rating === null) {
      return res.sendStatus(400);
    }

    const rating = new Rating();
    rating.user = req.user._id;
    rating.rating = req.body.rating;
    rating.date = new Date();

    const repo = await Database.getRepository(Quiz);

    await repo.updateOne(
      {
        _id: quiz._id,
        ratings: {
          $not: {
            $elemMatch: {
              user: req.user._id,
            },
          },
        },
      },
      {
        $push: {
          ratings: rating,
        } as any,
      },
    );

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

quizRouter.post('/:id/start', async (req, res) => {
  try {
    const user = req.user;

    const quiz = await Quiz.getById(req.params.id);
    if (quiz === null) return res.sendStatus(404);

    const game = await ActiveQuiz.startQuiz(req.params.id, 8, user?._id);
    if (game === null) return res.sendStatus(404);

    const rated = user ? quiz.ratings.some((rating) => rating.user.toHexString() === user._id.toHexString()) : true;

    const resp: PostGameStartResponse = {
      data: {
        id: game._id.toHexString(),
        quizId: game.quizId.toHexString(),
        rated,
        userId: game.userId?.toHexString() ?? null,
        totalQuestions: game.questionIds.length,
        currentQuestion: game.currentQuestion,
        rounds: game.rounds.map((round) => ({
          index: round.index,
          startedAt: round.startedAt.getTime(),
          endedAt: round.endedAt?.getTime() ?? null,
          response: round.response?.toHexString() ?? null,
          correctResponse: round.correctResponse.toHexString(),
        })),
      },
    };

    res.json(resp);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

quizRouter.get('/game/:id/question', async (req, res) => {
  try {
    const quiz = await ActiveQuiz.getById(req.params.id);
    if (quiz === null) return res.sendStatus(404);

    if (quiz.userId?.toHexString() !== req.user?._id.toHexString()) return res.sendStatus(403);

    const question = await ActiveQuiz.getActiveQuestion(req.params.id);
    if (question === null) return res.sendStatus(404);

    const resp: GetGameQuestionResponse = {
      data: {
        id: question._id.toHexString(),
        quizId: question.quiz.toHexString(),
        question: question.question,
        image: question.image,
        answers: question.answers.map((answer) => ({
          id: answer.id.toHexString(),
          content: answer.content,
        })),
      },
    };

    res.json(resp);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

quizRouter.post('/game/:id/answer', async (req, res) => {
  try {
    let answerId: string = '000000000000000000000000';
    if (typeof req.body.answerId === 'string' && req.body.answerId.length === 24) answerId = req.body.answerId;

    console.log(answerId);
    const game = await ActiveQuiz.getById(req.params.id);
    if (game === null) return res.sendStatus(404);

    if (game.userId?.toHexString() !== req.user?._id.toHexString()) return res.sendStatus(403);

    const question = await ActiveQuiz.getActiveQuestion(req.params.id);
    if (question === null) return res.sendStatus(404);

    const currentQuiz = await ActiveQuiz.submitAnswer(req.params.id, answerId);
    if (currentQuiz === null) return res.sendStatus(404);

    const round = currentQuiz.rounds[currentQuiz.currentQuestion - 1];
    if (round === undefined) return res.sendStatus(404);

    const user = req.user;

    const quiz = await Quiz.getById(currentQuiz.quizId.toHexString());
    if (quiz === null) return res.sendStatus(404);

    const rated = user ? quiz.ratings.some((rating) => rating.user.toHexString() === user._id.toHexString()) : true;

    const resp: PostGameAnswerResponse = {
      data: {
        id: currentQuiz._id.toHexString(),
        quizId: currentQuiz.quizId.toHexString(),
        userId: currentQuiz.userId?.toHexString() ?? null,
        rated,
        totalQuestions: currentQuiz.questionIds.length,
        currentQuestion: currentQuiz.currentQuestion,
        rounds: currentQuiz.rounds.map((round) => ({
          index: round.index,
          startedAt: round.startedAt.getTime(),
          endedAt: round.endedAt?.getTime() ?? null,
          response: round.response?.toHexString() ?? null,
          correctResponse: round.correctResponse.toHexString(),
        })),
      },
      correct: round.correctResponse.toHexString() === answerId,
      correctResponse: round.correctResponse.toHexString(),
    };

    res.json(resp);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 8,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/gif' ||
      file.mimetype === 'image/webp' ||
      file.mimetype === 'image/svg+xml'
    ) {
      cb(null, true);
    }

    cb(null, false);
  },
});
const fileUpload = upload.single('avatar');

quizRouter.post('/new', async (req, res) => {
  try {
    fileUpload(req, res, async (err) => {
      const { question, active, answers, quiz } = req.body;

      if (typeof question !== 'string' || !Array.isArray(answers)) {
        return res.sendStatus(400);
      }

      const formattedAnswers = answers.map((answer) => {
        const answerObjectId = new ObjectId();
        return {
          id: answerObjectId,
          content: answer,
          correct: false,
        };
      });

      const questionRepo = await Database.getRepository(Question);

      const now = new Date().toISOString();

      if (req.isUnauthenticated()) return res.sendStatus(401);
      if (req.user === undefined) return res.sendStatus(401);

      if (req.file === undefined) return res.sendStatus(400);

      const uuid = randomUUID().slice(0, 8);
      const extension = mime.extension(req.file.mimetype);
      const newFileName = `${uuid}.${extension}`;

      const avatar = await Media.create(req.file.buffer, newFileName, req.user._id);

      const isActive = active === 'true';
      const quizObjectId = new ObjectId(quiz);

      await questionRepo.insertOne({
        question: question,
        active: isActive,
        answers: [
          ...formattedAnswers,
          {
            id: new ObjectId(),
            content: req.body.correctAnswer,
            correct: true,
          },
        ],
        quiz: quizObjectId,
        createdAt: now,
        updatedAt: now,
        image: await avatar.getURL(),
      });

      res.sendStatus(200);
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
