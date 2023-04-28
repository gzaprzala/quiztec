import { IsDate, IsNumber } from "class-validator";
import { Column, Entity, ObjectId, ObjectIdColumn } from "typeorm";


export class PlayedBy {
  @ObjectIdColumn()
  public user: ObjectId;

  @Column()
  public startTime: Date;

  @Column()
  public finishTime: Date;

  @Column()
  @IsNumber()
  public score: number;
}

@Entity()
export class DailyChallenge {
  @ObjectIdColumn()
  public _id: ObjectId;

  @Column()
  @IsDate()
  public date: Date;

  @Column((type) => PlayedBy)
  public playedBy: PlayedBy[];

  @Column()
  public timePerQuestion: number;

  @Column()
  public questions: ObjectId[];
}