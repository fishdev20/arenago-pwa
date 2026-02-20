export const queryKeys = {
  authUser: ["auth-user"] as const,
  profile: (userId?: string) => ["profile", userId] as const,
  profileRole: (userId?: string) => ["profile-role", userId] as const,
};
