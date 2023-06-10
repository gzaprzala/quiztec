import { Achievement } from 'types/api/achievement';

export type ServerToClientEvents = {
  TEST_NOTIFICATION: (test: string) => void;

  UNL_ACHIEVEMENT: (achievement: Achievement) => void;
};

export type ClientToServerEvents = {
  TEST_NOTIFICATION: (test: string) => void;
};
