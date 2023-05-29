import { User } from '#database/entities/User';
import { Router as expressRouter } from 'express';
import { randomBytes, scrypt } from 'crypto';
import multer from 'multer';
import { randomUUID } from 'crypto';
import mime from 'mime';
import { Media } from '#database/entities/Media';
import { Database } from '#database/Database';

export const profileRouter = (): expressRouter => {
  const profileRouter = expressRouter();
  const storage = multer.memoryStorage();
  const upload = multer({
    storage,
    limits: {
      fileSize: 1024 * 1024 * 8,
    },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = [
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
  });
  const fileUpload = upload.single('avatar');

  profileRouter.post('/update', async (req, res) => {
    try {
      fileUpload(req, res, async (err) => {
        if (err) {
          console.error(err);
          return res.sendStatus(500);
        }

        const { username, password, email } = req.body;

        if (
          typeof username !== 'string' ||
          typeof password !== 'string' ||
          typeof email !== 'string'
        ) {
          return res.sendStatus(400);
        }

        const user = await User.getByUsername(username);

        if (!user) {
          return res.status(404).send('User not found');
        }

        const userByEmail = await User.getByEmail(email);

        if (userByEmail !== null) {
          return res.status(409).send('Email taken');
        }

        const userRepo = await Database.getRepository(User);
        const salt = randomBytes(64).toString('hex');

        scrypt(password, salt, 64, async (err, passwordHash) => {
          if (err) return res.sendStatus(500);

          if (req.file === undefined) return res.sendStatus(400);

          await userRepo.updateOne(
            { username: username },
            {
              $set: {
                username: username,
                email: email,
                passwordHash: passwordHash.toString('hex'),
                salt,
              },
            }
          );

          const uuid = randomUUID().slice(0, 8);
          const extension = mime.extension(req.file.mimetype);
          const newFileName = `${uuid}.${extension}`;

          const avatar = await Media.create(
            req.file.buffer,
            newFileName,
            user._id
          );

          await userRepo.updateOne(
            {
              _id: user._id,
            },
            {
              $set: {
                image: await avatar.getURL(),
              },
            }
          );

          return res.sendStatus(200);
        });
      });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

  return profileRouter;
};
