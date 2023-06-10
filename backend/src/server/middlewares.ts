import { Database } from '#database/Database';
import chalk from 'chalk';
import RedisStore from 'connect-redis';
import { RequestHandler } from 'express';
import session from 'express-session';

export const logger: RequestHandler = (req, res, next) => {
  console.log(
    chalk.bold.yellow(req.method),
    chalk.bold.green(req.hostname),
    req.url,
  );
  next();
};

export const invalidRoute: RequestHandler = (req, res) => {
  res.contentType('text/plain');
  res.status(404).send('Invalid Route');
};

export const notImplemented: RequestHandler = (req, res) => {
  res.sendStatus(501);
};

export const accessControl: RequestHandler = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.header('Origin') || '*');
  res.header('Vary', 'Origin');

  next();
};

export const generateSessionMiddleware = async (): Promise<RequestHandler> =>
  session({
    // secret: randomBytes(32).toString('hex'),
    secret: 'SUPER_SECRET_SECRET',
    resave: false,
    saveUninitialized: false,
    name: 'quiztec-auth',
    rolling: true,
    cookie: {
      signed: true,
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
    },
    store: new RedisStore({
      client: await Database.getRedisClient(),
      prefix: 'session_store:',
    }),
  });
