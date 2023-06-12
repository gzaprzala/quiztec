export enum Role {
  USER,
  MODERATOR,
  ADMIN,
}

export interface FrontendUser {
  id: string;
  username: string;
  profileImageUrl: string | null;
  roles: Role[];
}

export interface GetFrontendUser {
  data: FrontendUser;
}
