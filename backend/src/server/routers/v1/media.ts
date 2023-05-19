import { Router as expressRouter } from 'express';
import { Media } from '#database/entities/Media';
import multer from 'multer';
import { randomUUID } from 'crypto';
import mime from 'mime';
import { isDevMode } from '#shared/constants';

const storage = multer.memoryStorage();
const upload = multer({ storage });
const fileUpload = upload.single('file');

export const mediaRouter = expressRouter();

mediaRouter.get('/:id/:token/:fileName', async (req, res) => {
  try {
    if (req.params.id.length !== 24) return res.sendStatus(404);

    const file = await Media.getFileByIdWithAuth(req.params.id, req.params.fileName, req.params.token);

    res.setHeader('Content-Type', file.mime);
    res.send(file.buffer);
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
  }
});

//! Only for testing purposes
if (isDevMode) {
  mediaRouter.post('/upload', async (req, res) => {
    fileUpload(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      if (req.file === undefined) return res.sendStatus(400);

      const uuid = randomUUID().slice(0, 8);
      const extension = mime.extension(req.file.mimetype);
      const newFileName = `${uuid}.${extension}`;

      const file = await Media.create(req.file.buffer, newFileName);

      res.json({
        url: await file.getURL(),
      });
    });
  });
}
