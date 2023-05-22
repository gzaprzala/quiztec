import { IsBoolean, IsString, IsUrl } from 'class-validator';
import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

export class Answer {
  @Column({ type: 'string' })
  public id: ObjectId;

  @Column()
  @IsString()
  public content: string;

  @Column()
  @IsBoolean()
  public correct: boolean;

  constructor(content: string, correct: boolean) {
    this.content = content;
    this.correct = correct;

    this.id = new ObjectId();
  }
}

@Entity()
export class Question {
  @ObjectIdColumn()
  public _id: ObjectId;

  @Column({ type: 'string' })
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
