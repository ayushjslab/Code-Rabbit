declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string

    BETTER_AUTH_SECRET: string
    BETTER_AUTH_URL: string

    GITHUB_CLIENT_ID: string
    GITHUB_CLIENT_SECRET: string
  }
}
