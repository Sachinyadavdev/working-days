export const APP_CONSTANTS = {
  BCRYPT_SALT_ROUNDS: 12,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  REDIS_TTL: {
    PERMISSIONS: 3600,  // 1 hour
    SESSION: 86400,     // 24 hours
    SHORT: 300,         // 5 minutes
  },
  TASK_KEY_PREFIX: 'task:',
  USER_PERMISSIONS_KEY: 'user:permissions:',
} as const;
