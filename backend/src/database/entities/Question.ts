import { IsBoolean, IsString, IsUrl } from "class-validator";
import { Column, CreateDateColumn, Entity, ObjectId, ObjectIdColumn, UpdateDateColumn } from "typeorm";


export class Answer {
  @Column()
  @IsString()
  public content: string;

  @Column()
  @IsBoolean()
  public correct: boolean;

  constructor(content: string, correct: boolean) {
    this.content = content;
    this.correct = correct;
  }
}

@Entity()
export class Question {
  @ObjectIdColumn()
  public _id: ObjectId;

  @Column({ type: "string" })
  public quiz: ObjectId;

  @Column()
  @IsString()
  public question: string;

  @Column({ nullable: true })
  @IsUrl()
  public image: string | null;

  @Column((type) => Answer)
  public answers: Answer[] = [];

  @Column()
  @IsBoolean()
  public active: boolean = true;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}