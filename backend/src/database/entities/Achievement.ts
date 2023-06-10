import { IsString } from 'class-validator';
import { Column, Entity, Index, ObjectId, ObjectIdColumn } from 'typeorm';
import { ObjectId as ObjectIdClass } from 'mongodb';
import { Database } from '#database/Database';
import { display } from '#lib/display';
import { User, Achievement as UserAchievement } from '#database/entities/User';
import { SocketServer } from 'server/SocketServer';

@Entity()
export class Achievement {
  @ObjectIdColumn()
  public _id: ObjectId;

  @Column()
  @IsString()
  public identifier: string;

  @Column()
  @IsString()
  public name: string;

  @Column({ type: 'string', nullable: true })
  public game: ObjectId | null = null;

  @Column()
  @IsString()
  description: string;

  public static async getByIdentifier(identifier: string, gameId?: string | ObjectId): Promise<Achievement | null> {
    try {
      const repository = await Database.getRepository(this);
      const _gameId = gameId === undefined ? gameId : typeof gameId === 'string' ? ObjectIdClass.createFromHexString(gameId) : gameId;

      const achievement = await repository.findOne({
        where: {
          identifier,
          game: _gameId,
        },
      });

      return achievement;
    } catch (error) {
      display.warning.nextLine('Achievement:getByIdentifier', `Error retrieving achievement with identifier ${identifier}: ${error}`);
      return null;
    }
  }

  public static async optimisticUnlock(userId: string | ObjectId, identifier: string, gameId?: string | ObjectId): Promise<void> {
    const _userId = typeof userId === 'string' ? ObjectIdClass.createFromHexString(userId) : userId;
    const _gameId = gameId === undefined ? gameId : typeof gameId === 'string' ? ObjectIdClass.createFromHexString(gameId) : gameId;

    const userRepo = await Database.getRepository(User);
    const achievement = await this.getByIdentifier(identifier, _gameId);

    if (!achievement) {
      display.debug.nextLine('Achievement:optimisticUnlock', `Achievement with identifier ${identifier} not found.`);
      return;
    }

    const createdAchievement = new UserAchievement();
    createdAchievement.id = achievement._id;
    createdAchievement.gameId = achievement.game;
    createdAchievement.date = new Date();

    const result = await userRepo.updateOne(
      {
        _id: _userId,
        // 'achievements.id': { $ne: achievement._id },
        achievements: {
          $not: {
            $elemMatch: {
              id: achievement._id,
            },
          },
        },
      },
      {
        $addToSet: {
          achievements: createdAchievement as any,
        },
      },
    );

    if (result.modifiedCount === 0) return;

    SocketServer.emitToUser(_userId.toHexString(), 'UNL_ACHIEVEMENT', {
      id: achievement._id.toHexString(),
      name: achievement.name,
      description: achievement.description,
      timestamp: createdAchievement.date.getTime(),
    });
  }

  public static async getByGameId(gameId: string | ObjectId): Promise<Achievement[]> {
    const _gameId = typeof gameId === 'string' ? ObjectIdClass.createFromHexString(gameId) : gameId;
    const repository = await Database.getRepository(this);

    const achievements = await repository.find({
      where: {
        game: _gameId,
      },
    });

    return achievements;
  }
}
