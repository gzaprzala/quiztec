export interface FrontendUser {
  id: string;
  username: string;
  profileImageUrl: string | null;
}

export interface GetFrontendUser {
  data: FrontendUser;
}
