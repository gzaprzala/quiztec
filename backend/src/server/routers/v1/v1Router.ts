import { Router as expressRouter } from "express";

export const v1Router = expressRouter();

v1Router.use("/test", (req, res) =>
  res.json({
    message: "Test",
    time: new Date(),
  })
);
