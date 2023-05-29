import 'reflect-metadata';

import { isDevMode } from '#shared/constants';
import {
  DataSource,
  DataSourceOptions,
  MongoEntityManager,
  MongoRepository,
  ObjectLiteral,
} from 'typeorm';
import { Config } from '#database/entities/Config';
import { Achievement, User } from '#database/entities/User';
import { Redis, RedisOptions } from 'ioredis';
import { DailyChallenge } from '#database/entities/DailyChallenge';
import { Event } from '#database/entities/Event';
import { Question } from '#database/entities/Question';
import { Quiz } from '#database/entities/Quiz';
import { ActiveQuiz } from '#database/entities/ActiveQuiz';
import { GridFSBucket, MongoClient, ReadPreference } from 'mongodb';
import { Media } from '#database/entities/Media';

export class Database {
  private static instance: Database;
  private dataSource: DataSource;
  private redisClient: Redis;
  private mongoClient: MongoClient;
  private storageBucket: GridFSBucket;

  private constructor() {
    this.dataSource = new DataSource(Database.databaseOptions);
    this.redisClient = new Redis(Database.redisOptions);

    this.mongoClient = this.createMongoClient();
    this.storageBucket = this.createStorageBucket(this.mongoClient);
  }

  private static get redisOptions(): RedisOptions {
    return {
      port: parseInt(process.env.REDIS_PORT ?? '6379'),
      host: process.env.REDIS_HOST ?? 'localhost',
      password: process.env.DB_PASSWORD ?? 'DEV_PASSWD',
    };
  }

  private static get databaseOptions(): DataSourceOptions {
    return {
      type: 'mongodb',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '27017'),
      username: process.env.DB_USER ?? 'DEV_USR',
      password: process.env.DB_PASSWORD ?? 'DEV_PASSWD',
      authSource: 'admin',
      useNewUrlParser: true,
      database: isDevMode ? 'DEV_DB' : process.env.DB_NAME ?? 'PROD_DB',
      synchronize: true,
      logging: isDevMode,
      cache: {
        type: 'ioredis',
        ignoreErrors: false,
        options: Database.redisOptions,
      },
      entities: Database.databaseEntities,
    };
  }

  private createMongoClient(): MongoClient {
    const host = process.env.DB_HOST ?? 'localhost';
    const port = parseInt(process.env.DB_PORT ?? '27017');

    const url = `mongodb://${host}:${port}`;

    return new MongoClient(url, {
      authSource: 'admin',
      auth: {
        username: process.env.DB_USER ?? 'DEV_USR',
        password: process.env.DB_PASSWORD ?? 'DEV_PASSWD',
      },
    });
  }

  private createStorageBucket(client: MongoClient): GridFSBucket {
    const database = isDevMode ? 'DEV_DB' : process.env.DB_NAME ?? 'PROD_DB';

    return new GridFSBucket(client.db(database), {
      bucketName: 'StorageBucket',
      chunkSizeBytes: 8_388_608,
    });
  }

  private static get databaseEntities(): DataSourceOptions['entities'] {
    return [
      Config,
      Achievement,
      DailyChallenge,
      Event,
      Question,
      Quiz,
      User,
      ActiveQuiz,
      Media,
    ];
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }

  public static async getDataSource(): Promise<DataSource> {
    const database = Database.getInstance();

    if (!database.dataSource.isInitialized) {
      await database.dataSource.initialize();
    }

    return database.dataSource;
  }

  public static async getManager(): Promise<MongoEntityManager> {
    const dataSource = await Database.getDataSource();

    return dataSource.mongoManager;
  }

  public static async getRepository<T extends ObjectLiteral>(
    entity: new () => T
  ): Promise<MongoRepository<T>> {
    const manager = await Database.getManager();

    return manager.getMongoRepository(entity);
  }

  public static async invalidateCache(identifiers: string[]): Promise<void> {
    const dataSource = await Database.getDataSource();

    await dataSource.queryResultCache?.remove(identifiers);
  }

  public static async clearCache(): Promise<void> {
    const dataSource = await Database.getDataSource();

    await dataSource.queryResultCache?.clear();
  }

  public static async getRedisClient(): Promise<Redis> {
    const database = Database.getInstance();

    return database.redisClient;
  }

  public static getMongoClient(): MongoClient {
    const database = Database.getInstance();

    return database.mongoClient;
  }

  public static getStorageBucket(): GridFSBucket {
    const database = Database.getInstance();

    return database.storageBucket;
  }
}
