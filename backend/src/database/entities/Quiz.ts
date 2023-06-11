import { Database } from '#database/Database';
import { IsDate, IsNumber, IsString, IsUrl } from 'class-validator';
import { Column, CreateDateColumn, Entity, ObjectId, ObjectIdColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId as ObjectIdClass } from 'mongodb';

export class Rating {
  @Column({ type: 'string' })
  public user: ObjectId;

  @Column()
  @IsNumber()
  public rating: boolean;

  @Column()
  @IsDate()
  public date: Date;
}

export class VisitedPlayer {
  @Column({ type: 'string' })
  public userId: ObjectId;

  @Column()
  @IsDate()
  public date: Date;
}

@Entity()
export class Quiz {
  @ObjectIdColumn()
  public _id: ObjectId;

  @Column()
  @IsString()
  public title: string;

  @Column()
  @IsString()
  public developer: string;

  @Column()
  @IsUrl()
  public backgroundImage: string;

  @Column()
  @IsString({ each: true })
  public tags: string[];

  @Column()
  @IsString()
  public author: string;

  @Column((type) => Rating, { array: true })
  public ratings: Rating[] = [];

  @Column((type) => VisitedPlayer, { array: true })
  public visitedPlayers: VisitedPlayer[] = [];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  public static async getById(id: string): Promise<Quiz | null> {
    const repo = await Database.getRepository(Quiz);

    return repo.findOne({
      where: {
        _id: ObjectIdClass.createFromHexString(id),
      },
    });
  }
}
