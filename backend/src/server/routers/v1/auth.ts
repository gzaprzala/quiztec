import { User } from '#database/entities/User';
import { Router as expressRouter } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { Database } from '#database/Database';


export const authRouter = (): expressRouter => {
  const authRouter = expressRouter();

  passport.serializeUser<string>(async (user, done) => {
    done(null, user._id.toHexString());
  });

  passport.deserializeUser<string>(async (id, done) => {
    try {
      const user = await User.getById(id);

      if (user !== null) {
        done(null, user);
      }
      else throw new Error('Failed to fetch user profile');
    } catch (err) {
      done(null, false);
    }
  });

  passport.use('passport-local', new LocalStrategy({
    usernameField: 'email',
  },
    async (email, password, done) => {
      try {
        const user = await User.getByEmail(email);

        if (user === null) return done(null, false, { message: 'Incorrect email or password.' });
        console.log(password, user.salt, user.passwordHash);
        
        scrypt(password, user.salt, 64, (err, hashedPassword) => {
          if (err) done(err);

          if (!timingSafeEqual(Buffer.from(user.passwordHash, 'hex'), hashedPassword)) return done(null, false, { message: 'Incorrect email or password.' });
          else return done(null, user);
        });
      } catch (err) {
        done(err);
      }
    }
  ));

  authRouter.post('/login', passport.authenticate('passport-local', {
    failureMessage: true,
  }), (req, res) => res.sendStatus(200));

  authRouter.post('/logout', async (req, res) => {
    req.logout((err) => {
      if (err) res.status(500).send(err);
      // else if (err) res.sendStatus(500);
      else res.sendStatus(200);
    });
  });

  authRouter.post('/register', async (req, res) => {
    try {
      const { username, password, email } = req.body;

      if (
        typeof username !== 'string' ||
        typeof password !== 'string' ||
        typeof email !== 'string'
      ) {
        res.sendStatus(400);
        return;
      }
  
      const user = await User.getByUsername(username);
  
      if (user !== null) {
        res.status(409).send('Username taken');
        return;
      }
  
      const userByEmail = await User.getByEmail(username);
  
      if (userByEmail !== null) {
        res.status(409).send('Email taken');
        return;
      }
  
      const userRepo = await Database.getRepository(User);
      const salt = randomBytes(64).toString('hex');
      console.log(salt);
  
      scrypt(password, salt, 64, async (err, passwordHash) => {
        if (err) return res.sendStatus(500);
        console.log(passwordHash.toString('hex'));
  
        const newUser = userRepo.create({
          username,
          email,
          passwordHash: passwordHash.toString('hex'),
          salt,
        });
    
        await userRepo.save(newUser);
        res.sendStatus(200);
      });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

  authRouter.get('/user', async (req, res) => {
    if (req.isUnauthenticated()) return res.sendStatus(401);
    if (req.user === undefined) return res.sendStatus(401);
 
    const resp = {
      data: {
        id: req.user._id.toHexString(),
        username: req.user.username,
        profileImageUrl: req.user.image,
      },
    };

    res.json(resp);
  });

  return authRouter;
}
