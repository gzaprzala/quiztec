import { Database } from '#database/Database';
import { IsArray, IsDate, IsEmail, IsString, IsUrl } from 'class-validator';
import { Column, CreateDateColumn, Entity, ObjectId, ObjectIdColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId as ObjectIdClass } from 'mongodb';

export enum Role {
  USER,
  MODERATOR,
  ADMIN,
}

export class Achievement {
  @ObjectIdColumn()
  public id: ObjectId;

  @Column()
  @IsDate()
  public date: Date;
}

export class VisitedQuiz {
  @ObjectIdColumn()
  public quiz: ObjectId;

  @Column()
  @IsDate()
  public date: Date;
}

export class Round {
  @Column()
  public index: number;

  @Column({ type: 'string' })
  public question: ObjectId;

  @Column({ type: 'string', nullable: true })
  public response: ObjectId | null = null;

  @Column({ type: 'string', nullable: true })
  public correctResponse: ObjectId;

  @Column()
  @IsDate()
  public startedAt: Date;

  @Column()
  @IsDate()
  public endedAt: Date;
}

export class PlayedQuiz {
  @Column({ type: 'string' })
  public quizId: ObjectId;

  @Column((type) => Round)
  public rounds: Round[] = [];

  @Column()
  public points = 0;
}

@Entity()
export class User {
  @ObjectIdColumn()
  public _id: ObjectId;

  @Column({ unique: true, nullable: false })
  @IsString()
  public username: string;

  @Column()
  public passwordHash: string;

  @Column()
  public salt: string;

  @Column({ unique: true, nullable: false })
  @IsEmail()
  public email: string;

  @Column()
  @IsUrl()
  public image: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER, array: true, nullable: false })
  public roles: Role[] = [Role.USER];

  @Column((type) => Achievement, { array: true })
  public achievements: Achievement[] = [];

  @Column((type) => VisitedQuiz, { array: true })
  public visitedQuizzes: VisitedQuiz[] = [];

  @Column((type) => PlayedQuiz, { array: true })
  public playedQuizzes: PlayedQuiz[] = [];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  public static async getById(id: string): Promise<User | null> {
    const repository = await Database.getRepository(this);

    return repository.findOne({
      where: { _id: ObjectIdClass.createFromHexString(id) },
      cache: {
        id: `user:${id}`,
        milliseconds: 10000,
      },
    });
  }

  public static async getByUsername(username: string): Promise<User | null> {
    const repository = await Database.getRepository(this);

    return repository.findOne({
      where: { username },
      cache: {
        id: `user:${username}`,
        milliseconds: 10000,
      },
    });
  }

  public static async getByEmail(email: string): Promise<User | null> {
    const repository = await Database.getRepository(this);

    return repository.findOne({
      where: { email },
      cache: {
        id: `user:${email}`,
        milliseconds: 10000,
      },
    });
  }
}
