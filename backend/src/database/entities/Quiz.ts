import { IsNumber, IsString, IsUrl } from "class-validator";
import { Column, CreateDateColumn, Entity, ObjectId, ObjectIdColumn, UpdateDateColumn } from "typeorm";


export class Rating {
  @ObjectIdColumn()
  public user: ObjectId;

  @Column()
  @IsNumber()
  public rating: number;
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

  // @Column()
  // @IsString()
  // public description: string;

  @Column()
  @IsUrl()
  public backgroundImage: string;

  @Column()
  @IsString({ each: true })
  public tags: string[];

  @Column()
  @IsString()
  public author: string;

  @Column((type) => Rating)
  public ratings: Rating[] = [];

  @Column()
  public achievements: ObjectId[] = [];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}