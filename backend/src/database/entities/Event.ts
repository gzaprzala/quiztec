import { IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, ObjectId, ObjectIdColumn } from "typeorm";


@Entity()
export class Event {
  @ObjectIdColumn()
  public _id: ObjectId;

  @Column({nullable: true, type: 'string'})
  public user: ObjectId | null;

  @Column()
  @IsString()
  public type: string;

  @Column()
  @IsString()
  public data: string;

  @CreateDateColumn()
  public createdAt: Date;
}
