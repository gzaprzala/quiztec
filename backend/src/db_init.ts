import registerAliases from "module-alias";
import 'dotenv/config';

if (process.env.NODE_DEV !== "true") {
  registerAliases();
}

import { Database } from "#database/Database";
import { Answer, Question } from "#database/entities/Question";
import { Quiz } from "#database/entities/Quiz";


const main = async (): Promise<void> => {
  const { default: csgo } = await import('./csgo.json');
  const { default: valorant } = await import('./valorant.json');
  const { default: league } = await import('./league.json');
  const { default: fortnite } = await import('./fortnite.json');

  const questionRepo = await Database.getRepository(Question);
  const quizRepo = await Database.getRepository(Quiz);
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

  const addQuestions = async (quiz: Quiz, questions: typeof csgo) => {
    for (const question of questions) {
      const newQuestion = new Question();
      newQuestion.quiz = quiz._id;
      newQuestion.question = question.question;
      newQuestion.answers = question.answers
        .map((answer) => new Answer(
          answer.content,
          answer.correct,
        ));
  
      await questionRepo.save(newQuestion);
    } 
  }

  await addQuestions(createdQuizCsgo, csgo);
  await addQuestions(createdQuizValorant, valorant);
  await addQuestions(createdQuizLeague, league);
  await addQuestions(createdQuizFortnite, fortnite);

  process.exit();
};

void main();
