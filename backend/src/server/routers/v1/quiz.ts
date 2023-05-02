import { Router as expressRouter } from "express";
import { authRouter } from "server/routers/v1/auth";
import bodyParser from 'body-parser';
import { Database } from "#database/Database";
import { Quiz } from "#database/entities/Quiz";
import { GetQuestionListResponse, GetQuizListResponse } from "#types/api/quiz";
import { Question } from "#database/entities/Question";
import { ObjectId } from "mongodb";
import { BSONError } from "bson";

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
        players: 0,
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
          quiz: question.quiz.toHexString(),
          question: question.question,
          image: question.image,
          answers: question.answers.map((answer) => ({
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