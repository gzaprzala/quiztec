import registerAliases from 'module-alias';
import 'dotenv/config';

if (process.env.NODE_DEV !== 'true') {
  registerAliases();
}

import { Database } from '#database/Database';
import { Answer, Question } from '#database/entities/Question';
import { Quiz } from '#database/entities/Quiz';
import { Achievement } from '#database/entities/Achievement';

const main = async (): Promise<void> => {
  const { default: csgo } = await import('./csgo.json');
  const { default: valorant } = await import('./valorant.json');
  const { default: league } = await import('./league.json');
  const { default: fortnite } = await import('./fortnite.json');
  const { default: achievements } = await import('./achievements.json');

  const achievementRepo = await Database.getRepository(Achievement);
  const questionRepo = await Database.getRepository(Question);
  const quizRepo = await Database.getRepository(Quiz);
  await achievementRepo.deleteMany({});
  await questionRepo.deleteMany({});
  await quizRepo.deleteMany({});

  const quizCsgo = quizRepo.create({
    title: 'Counter-Strike: Global Offensive',
    developer: 'Valve',
    tags: ['FPS', 'Shooter', 'Multiplayer'],
    author: 'quiztec team',
    backgroundImage: '/grids/csgo.webp',
  });

  const quizValorant = quizRepo.create({
    title: 'Valorant',
    developer: 'Riot Games',
    tags: ['FPS', 'Shooter', 'Multiplayer'],
    author: 'quiztec team',
    backgroundImage: '/grids/valorant.webp',
  });

  const quizLeague = quizRepo.create({
    title: 'League of Legends',
    developer: 'Riot Games',
    tags: ['MOBA', 'Strategy', 'Multiplayer'],
    author: 'quiztec team',
    backgroundImage: '/grids/lol.webp',
  });

  const quizFortnite = quizRepo.create({
    title: 'Fortnite',
    developer: 'Epic Games',
    tags: ['Battle Royale', 'Shooter', 'Multiplayer'],
    author: 'quiztec team',
    backgroundImage: '/grids/fortnite.webp',
  });

  const createdQuizCsgo = await quizRepo.save(quizCsgo);
  const createdQuizValorant = await quizRepo.save(quizValorant);
  const createdQuizLeague = await quizRepo.save(quizLeague);
  const createdQuizFortnite = await quizRepo.save(quizFortnite);

  const processGame = async (quiz: Quiz, questions: typeof csgo) => {
    for (const question of questions) {
      const newQuestion = new Question();
      newQuestion.quiz = quiz._id;
      newQuestion.question = question.question;
      newQuestion.answers = question.answers.map((answer) => new Answer(answer.content, answer.correct));

      await questionRepo.save(newQuestion);
    }

    for (const achievement of achievements.gameAgnostic) {
      const newAchievement = new Achievement();
      newAchievement.game = quiz._id;
      newAchievement.identifier = achievement.identifier;
      newAchievement.name = achievement.name;
      newAchievement.description = achievement.description;

      await achievementRepo.save(newAchievement);
    }
  };

  await processGame(createdQuizCsgo, csgo);
  await processGame(createdQuizValorant, valorant);
  await processGame(createdQuizLeague, league);
  await processGame(createdQuizFortnite, fortnite);

  for (const achievement of achievements.system) {
    const newAchievement = new Achievement();
    newAchievement.identifier = achievement.identifier;
    newAchievement.name = achievement.name;
    newAchievement.description = achievement.description;

    await achievementRepo.save(newAchievement);
  }

  process.exit();
};

void main();
