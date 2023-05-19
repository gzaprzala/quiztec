import { Database } from '#database/Database';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { ObjectId as ObjectIdClass } from 'mongodb';
import mime from 'mime';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, GridFSFile, ObjectId, ObjectIdColumn, UpdateDateColumn } from 'typeorm';
import { display } from '#lib/display';

export interface MediaAuth {
  id: string;
  token: string;
  fileName: string;
}

@Entity()
export class Media {
  private static SALT_LENGTH = 16;

  @ObjectIdColumn()
  public _id: ObjectId;

  @Column()
  public fileName: string;

  @Column()
  public salt: string;

  @Column()
  public token: string;

  @Column()
  public mime: string;

  @Column({ nullable: true })
  public author: ObjectId | null;

  @Column()
  public bucketFile: GridFSFile;

  public buffer: Buffer | null = null;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  public deletedAt: Date | null;

  public static async getFromBucketById(id: ObjectId): Promise<GridFSFile | null> {
    const bucket = Database.getStorageBucket();
    const file = bucket.find({ _id: id });

    return file.tryNext();
  }

  public static async getFromBucketFileById(id: ObjectId): Promise<Buffer> {
    const bucket = Database.getStorageBucket();
    const file = bucket.openDownloadStream(id);

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      file.on('data', (chunk) => {
        chunks.push(chunk);
      });

      file.on('error', (err) => {
        console.error(err);
        reject(err);
      });

      file.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }

  public static create(buffer: Buffer, name: string, author?: ObjectId): Promise<Media> {
    return new Promise((resolve, reject) => {
      const bucket = Database.getStorageBucket();

      const bucketFile = bucket.openUploadStream(name);
      bucketFile.end(buffer);

      bucketFile
        .on('finish', async () => {
          const file = await this.getFromBucketById(bucketFile.id);
          if (file === null) return reject(new Error('Failed to create media'));

          const media = new Media();
          const mediaRepo = await Database.getRepository(Media);

          media.fileName = name;
          media.mime = mime.lookup(name, 'application/octet-stream');
          media.salt = randomBytes(this.SALT_LENGTH).toString('hex');
          media.author = author ?? null;
          media.bucketFile = file;

          try {
            const tmpMedia = await mediaRepo.save(media);
            tmpMedia.token = await tmpMedia.generateToken();

            const createdMedia = await mediaRepo.save(tmpMedia);
            resolve(createdMedia);
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => {
          console.error(err);
          reject(err);
        });
    });
  }

  public static async getById(id: string | ObjectId): Promise<Media | null> {
    const _id = typeof id === 'string' ? ObjectIdClass.createFromHexString(id) : id;
    const mediaRepo = await Database.getRepository(Media);

    return mediaRepo.findOne({
      where: { _id },
      cache: {
        id: `media:${_id.toHexString()}`,
        milliseconds: 1000 * 60,
      },
    });
  }

  public static async getFileBytId(id: string | ObjectId): Promise<Media> {
    const _id = typeof id === 'string' ? ObjectIdClass.createFromHexString(id) : id;
    const media = await this.getById(_id);

    if (media === null) throw new Error('Media not found');

    const buffer = await this.getFromBucketFileById(media.bucketFile._id);
    media.buffer = buffer;

    return media;
  }

  public static getFileByIdWithAuth(id: string | ObjectId, fileName: string, key: string): Promise<Media> {
    return new Promise(async (resolve, reject) => {
      const _id = typeof id === 'string' ? ObjectIdClass.createFromHexString(id) : id;
      const media = await this.getById(_id);

      if (media === null) throw new Error('Media not found');

      if (!timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(media.token, 'hex'))) reject(new Error('Unauthorized'));
      const buffer = await this.getFromBucketFileById(media.bucketFile._id);
      media.buffer = buffer;

      resolve(media);
    });
  }

  public async generateToken(): Promise<string> {
    const password = `${this._id.toHexString()}:${this.fileName}`;
    const time = performance.now();

    return new Promise((resolve, reject) => {
      scrypt(password, this.salt, Media.SALT_LENGTH, (err, hashedId) => {
        if (err) reject(err);

        display.time('Generating media auth', time);
        resolve(hashedId.toString('hex'));
      });
    });
  }

  public getURL(): string {
    return `/api/v1/media/${this._id.toHexString()}/${this.token}/${this.fileName}`;
  }

  public static decodeURL(url: string): MediaAuth {
    const [id, token, fileName] = url.split('/').slice(-3);

    if (typeof id !== 'string' || typeof token !== 'string' || typeof fileName !== 'string') {
      throw new Error('Invalid URL');
    }

    return {
      id,
      token,
      fileName,
    };
  }
}
