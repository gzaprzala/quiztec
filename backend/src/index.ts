import registerAliases from "module-alias";

if (process.env.NODE_DEV !== "true") {
  registerAliases();
}

import { createServer, ViteDevServer } from "vite";
import express, { Express, RequestHandler } from "express";
import { accessControl, invalidRoute, logger } from "./server/middlewares";
import { apiRouter } from "./server/routers/apiRouter";
import compression, { CompressionOptions } from "compression";
import {
  frontendPath,
  frontendProductionPath,
  isDevMode,
  serverPort,
} from "#shared/constants";
import chalk from "chalk";
import path from "path";

const compressionOptions: CompressionOptions = {
  level: 7,
};

const main = async (): Promise<void> => {
  const app = express();
  let vite: ViteDevServer;

  app.use(accessControl);

  app.use(logger);
  app.use(compression(compressionOptions));
  app.use("/api", apiRouter);

  if (isDevMode) {
    vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(frontendProductionPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  }

  app.use(invalidRoute);

  app.listen(serverPort, () => {
    console.log(
      `${
        isDevMode ? "Development server" : "Server"
      } started on port ${chalk.green.bold(serverPort)}`
    );
  });
};

void main();
