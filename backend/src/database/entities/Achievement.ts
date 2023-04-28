import { IsString } from "class-validator";
import { Column, Entity, ObjectId, ObjectIdColumn } from "typeorm";


@Entity()
export class Achievement {
  @ObjectIdColumn()
  public _id: ObjectId;

  @Column()
  @IsString()
  public name: string;

  @Column()
  @IsString()
  public icon: string;

  @Column()
  public game: ObjectId;
}