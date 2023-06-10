import { IsDate, IsNumber, IsString, IsUrl } from 'class-validator';
import { Column, CreateDateColumn, Entity, ObjectId, ObjectIdColumn, UpdateDateColumn } from 'typeorm';

export class Rating {
  @ObjectIdColumn()
  public user: ObjectId;

  @Column()
  @IsNumber()
  public rating: number;
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
}
