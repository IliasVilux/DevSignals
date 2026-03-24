export interface UpsertUserData {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string;
  picture: string | null;
}
