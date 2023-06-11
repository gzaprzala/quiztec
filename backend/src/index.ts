import registerAliases from 'module-alias';
import 'dotenv/config';

if (process.env.NODE_DEV !== 'true') {
  registerAliases();
}

import { createServer, ViteDevServer } from 'vite';
import express from 'express';
import { accessControl, generateSessionMiddleware, invalidRoute, logger } from './server/middlewares';
import { apiRouter } from './server/routers/apiRouter';
import compression, { CompressionOptions } from 'compression';
import { frontendPath, frontendProductionPath, isDevMode, serverPort } from '#shared/constants';
import chalk from 'chalk';
import path from 'path';
import { User as UserEntity } from '#database/entities/User';
import http from 'http';
import passport from 'passport';
import { SocketServer } from './server/SocketServer';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends UserEntity {}
  }
}

declare module 'express-session' {
  interface SessionData {
    passport: {
      user: string;
    };
  }
}

const compressionOptions: CompressionOptions = {
  level: 7,
};

const main = async (): Promise<void> => {
  const app = express();
  const server = http.createServer(app);

  let vite: ViteDevServer;

  app.use(accessControl);

  app.use(logger);
  app.use(compression(compressionOptions));

  app.use(await generateSessionMiddleware());

  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/api', apiRouter);

  if (isDevMode) {
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(frontendProductionPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }

  app.use(invalidRoute);

  await SocketServer.createInstance(server);

  server.listen(serverPort, () => {
    console.log(`${isDevMode ? 'Development server' : 'Server'} started on port ${chalk.green.bold(serverPort)}`);
  });
};

void main();
