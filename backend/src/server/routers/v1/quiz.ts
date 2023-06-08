import { Router as expressRouter } from 'express';
import { Database } from '#database/Database';
import { Quiz } from '#database/entities/Quiz';
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

export const quizRouter = expressRouter();

quizRouter.get('/list', async (req, res) => {
  try {
    const quizRepo = await Database.getRepository(Quiz);
    const quizzes = await quizRepo.find();

    const resp: GetQuizListResponse = {
      data: quizzes.map((quiz) => ({
        id: quiz._id.toHexString(),
        title: quiz.title,
        developer: quiz.developer,
        tags: quiz.tags,
        rating: 0,
        players: quiz.visitedPlayers.length,
        achievements: 0,
        totalAchievements: quiz.achievements.length,
        author: quiz.author,
        backgroundImageUrl: quiz.backgroundImage,
      })),
    };

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

quizRouter.post('/:id/start', async (req, res) => {
  try {
    const user = req.user;

    const quiz = await ActiveQuiz.startQuiz(req.params.id, 8, user?._id);
    if (quiz === null) return res.sendStatus(404);

    const resp: PostGameStartResponse = {
      data: {
        id: quiz._id.toHexString(),
        quizId: quiz.quizId.toHexString(),
        userId: quiz.userId?.toHexString() ?? null,
        totalQuestions: quiz.questionIds.length,
        currentQuestion: quiz.currentQuestion,
        rounds: quiz.rounds.map((round) => ({
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

    if (quiz.userId?.toHexString() !== req.user?._id.toHexString())
      return res.sendStatus(403);

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
    if (
      typeof req.body.answerId === 'string' &&
      req.body.answerId.length === 24
    )
      answerId = req.body.answerId;

    console.log(answerId);
    const quiz = await ActiveQuiz.getById(req.params.id);
    if (quiz === null) return res.sendStatus(404);

    if (quiz.userId?.toHexString() !== req.user?._id.toHexString())
      return res.sendStatus(403);

    const question = await ActiveQuiz.getActiveQuestion(req.params.id);
    if (question === null) return res.sendStatus(404);

    const currentQuiz = await ActiveQuiz.submitAnswer(req.params.id, answerId);
    if (currentQuiz === null) return res.sendStatus(404);

    const round = currentQuiz.rounds[currentQuiz.currentQuestion - 1];
    if (round === undefined) return res.sendStatus(404);

    const resp: PostGameAnswerResponse = {
      data: {
        id: currentQuiz._id.toHexString(),
        quizId: currentQuiz.quizId.toHexString(),
        userId: currentQuiz.userId?.toHexString() ?? null,
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

      if (
        typeof question !== 'string' ||
        typeof active !== 'string' ||
        typeof quiz !== 'string' ||
        !Array.isArray(answers)
      ) {
        return res.sendStatus(400);
      }

      const formattedAnswers = answers.map((answer) => ({
        content: answer,
        correct: false,
      }));

      const questionRepo = await Database.getRepository(Question);

      const now = new Date().toISOString();

      if (req.isUnauthenticated()) return res.sendStatus(401);
      if (req.user === undefined) return res.sendStatus(401);

      if (req.file === undefined) return res.sendStatus(400);

      const uuid = randomUUID().slice(0, 8);
      const extension = mime.extension(req.file.mimetype);
      const newFileName = `${uuid}.${extension}`;

      const avatar = await Media.create(
        req.file.buffer,
        newFileName,
        req.user._id
      );

      await questionRepo.insertOne({
        question: question,
        active: active,
        answers: [
          ...formattedAnswers,
          { content: req.body.correctAnswer, correct: true },
        ],
        quiz: quiz,
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
