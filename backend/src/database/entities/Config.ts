import { Column, CreateDateColumn, DeleteDateColumn, Entity, ObjectIdColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm';


@Entity()
export class Config {
  @ObjectIdColumn()
  public _id: string;

  @Column()
  public key: string;

  @Column('text')
  public value: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @DeleteDateColumn()
  public destroyedAt?: Date;
}
