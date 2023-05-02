import { Router as expressRouter } from "express";
import { authRouter } from "server/routers/v1/auth";
import bodyParser from 'body-parser';
import { quizRouter } from "server/routers/v1/quiz";


export const v1Router = expressRouter();

v1Router.use(bodyParser.json());

v1Router.use("/test", (req, res) =>
  res.json({
    message: "Test",
    time: new Date(),
  })
);

v1Router.use('/auth', authRouter());

v1Router.use('/quiz', quizRouter);