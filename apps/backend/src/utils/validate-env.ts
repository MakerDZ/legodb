import { cleanEnv, str, num } from 'envalid';

const env = cleanEnv(process.env, {
    DATABASE_URL: str(),
    PORT: num(),
    NODE_ENV: str({
        choices: ['development', 'test', 'production', 'staging'],
    }),
});

export { env };
