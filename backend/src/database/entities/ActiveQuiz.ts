import { PlayedQuiz, Round, User, VisitedQuiz } from '#database/entities/User';
import { Column, CreateDateColumn, Entity, ObjectId, ObjectIdColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId as ObjectIdClass } from 'mongodb';
import { Database } from '#database/Database';
import { Question } from '#database/entities/Question';
import { Quiz, VisitedPlayer } from '#database/entities/Quiz';
import { Achievement } from '#database/entities/Achievement';

@Entity()
export class ActiveQuiz {
  private static readonly TIME_PER_QUESTION: number = 10;

  @ObjectIdColumn()
  public _id: ObjectId;

  @Column({ type: 'string' })
  public quizId: ObjectId;

  @Column({ type: 'string', nullable: true })
  public userId: ObjectId | null = null;

  @Column()
  public totalQuestions: number = 0;

  @Column()
  public currentQuestion: number = 0;

  @Column()
  public questionIds: ObjectId[] = [];

  @Column((type) => Round)
  public rounds: Round[] = [];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  public static async getById(id: string | ObjectIdClass): Promise<ActiveQuiz | null> {
    const _id = typeof id === 'string' ? ObjectIdClass.createFromHexString(id) : id;
    const repository = await Database.getRepository(this);

    return repository.findOne({
      where: { _id },
    });
  }

  public static async getRandomQuestionIds(quizId: string, questions: number = 8): Promise<ObjectId[]> {
    const repository = await Database.getRepository(Question);
    const pickedQuestions: ObjectId[] = [];
    let failedAttempts: number = 0;

    const questionIds = await repository.find({
      where: {
        quiz: ObjectIdClass.createFromHexString(quizId),
      },
      select: ['_id'],
    });

    questions = Math.min(questions, questionIds.length);

    while (pickedQuestions.length < questions && failedAttempts < 100) {
      const question = questionIds[Math.floor(Math.random() * questionIds.length)];
      if (question === undefined) {
        failedAttempts += 1;
        continue;
      }

      if (!pickedQuestions.includes(question._id)) {
        pickedQuestions.push(question._id);
      } else {
        failedAttempts += 1;
      }
    }

    return pickedQuestions;
  }

  public static async startQuiz(quizId: string, questions: number = 8, userId?: string | ObjectIdClass): Promise<ActiveQuiz> {
    const userIdObj = userId === undefined ? null : typeof userId === 'string' ? ObjectIdClass.createFromHexString(userId) : userId;
    const repository = await Database.getRepository(this);

    const quiz = repository.create({
      userId: userIdObj ?? null,
      quizId: ObjectIdClass.createFromHexString(quizId),
      totalQuestions: questions,
      questionIds: await this.getRandomQuestionIds(quizId, questions),
    });

    return repository.save(quiz);
  }

  public static async getActiveQuestion(quizId: string | ObjectIdClass): Promise<Question | null> {
    const quizIdObj = typeof quizId === 'string' ? ObjectIdClass.createFromHexString(quizId) : quizId;
    const quiz = await this.getById(quizIdObj);

    if (quiz === null) return null;

    const questionRepo = await Database.getRepository(Question);
    const question = await questionRepo.findOne({
      where: {
        _id: quiz.questionIds[quiz.currentQuestion],
      },
    });

    if (question === null) return null;

    if (quiz.rounds[quiz.currentQuestion] === undefined) {
      const round = new Round();

      round.index = quiz.currentQuestion;
      round.question = question._id;
      round.correctResponse = question.answers.find((answer) => answer.correct)?.id ?? new ObjectIdClass(); // dirty code
      round.startedAt = new Date();

      quiz.rounds[quiz.currentQuestion] = round;
      await (await Database.getRepository(this)).save(quiz);
    }

    return question;
  }

  public static async submitAnswer(quizId: string | ObjectIdClass, answerId: string | ObjectId): Promise<ActiveQuiz | null> {
    const answerIdObj = typeof answerId === 'string' ? ObjectIdClass.createFromHexString(answerId) : answerId;
    const repository = await Database.getRepository(this);

    const quiz = await this.getById(quizId);
    if (quiz === null) return null;

    const round = quiz.rounds[quiz.currentQuestion];
    if (round === undefined) return null;

    console.log(Date.now(), round.startedAt.getTime(), this.TIME_PER_QUESTION * 1000);

    if (Date.now() - round.startedAt.getTime() >= this.TIME_PER_QUESTION * 1000) {
      round.response = null;
    } else {
      round.response = answerIdObj;
    }

    round.endedAt = new Date();
    quiz.currentQuestion += 1;

    if (quiz.currentQuestion >= quiz.totalQuestions) {
      await this.finishQuiz(quiz);
      return quiz;
    } else {
      return repository.save(quiz);
    }
  }

  private static async finishQuiz(quiz: ActiveQuiz): Promise<void> {
    const repository = await Database.getRepository(this);

    if (quiz.userId !== null) {
      const userRepo = await Database.getRepository(User);
      const quizRepo = await Database.getRepository(Quiz);
      const user = await User.getById(quiz.userId.toHexString());

      if (user === null) return;

      const playedQuiz = new PlayedQuiz();
      playedQuiz.quizId = quiz.quizId;
      playedQuiz.rounds = quiz.rounds;
      playedQuiz.points = quiz.rounds.filter(
        (round) => round.correctResponse !== null && round.response?.toHexString() === round.correctResponse.toHexString(),
      ).length;

      await userRepo.updateOne(
        {
          _id: user._id,
        },
        {
          $push: {
            playedQuizzes: playedQuiz,
          } as any, // dirty code
        },
      );

      const visitedQuiz: VisitedQuiz = {
        quizId: quiz.quizId,
        date: new Date(),
      };

      await userRepo.updateOne(
        {
          _id: user._id,
          visitedQuizzes: {
            $not: {
              $elemMatch: {
                quizId: visitedQuiz.quizId,
              },
            },
          },
        },
        {
          $push: {
            visitedQuizzes: visitedQuiz,
          } as any, // dirty code
        },
      );

      const visitedPlayer: VisitedPlayer = {
        userId: user._id,
        date: new Date(),
      };

      const updatedVisits = await quizRepo.updateOne(
        {
          _id: quiz.quizId,
          visitedPlayers: {
            $not: {
              $elemMatch: {
                userId: user._id,
              },
            },
          },
        },
        {
          $push: {
            visitedPlayers: visitedPlayer,
          } as any, // dirty code
        },
      );

      if (updatedVisits.modifiedCount !== 0) {
        Achievement.optimisticUnlock(user._id, 'GAME_AGN_FIRST_QUIZ', quiz.quizId);
      }

      if (playedQuiz.points === quiz.totalQuestions) {
        Achievement.optimisticUnlock(user._id, 'GAME_AGN_PERFECT_GAME', quiz.quizId);
      }

      if (quiz.updatedAt.getTime() - quiz.createdAt.getTime() < 90 * 1000) {
        Achievement.optimisticUnlock(user._id, 'GAME_AGN_UNDER_90', quiz.quizId);
      }

      if (quiz.updatedAt.getTime() - quiz.createdAt.getTime() < 60 * 1000) {
        Achievement.optimisticUnlock(user._id, 'GAME_AGN_UNDER_60', quiz.quizId);
      }

      if (quiz.updatedAt.getTime() - quiz.createdAt.getTime() < 30 * 1000) {
        Achievement.optimisticUnlock(user._id, 'GAME_AGN_UNDER_30', quiz.quizId);
      }

      await Database.invalidateCache([`user:${user._id.toHexString()}`]);
      const updatedUser = await User.getById(user._id.toHexString());

      if (updatedUser === null) return;

      const playedQuizzes = updatedUser.playedQuizzes.filter((pq) => pq.quizId.toHexString() === quiz.quizId.toHexString());

      if (playedQuizzes.length >= 5) {
        Achievement.optimisticUnlock(user._id, 'GAME_AGN_10_GAMES', quiz.quizId);
      }
    }

    await repository.deleteOne({ _id: quiz._id });
  }
}
