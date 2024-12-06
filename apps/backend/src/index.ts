import 'dotenv/config';
import createServer from './libs/server';
import { env } from './utils/validate-env';

(async () => {
    const server = await createServer();
    const address = await server.listen({
        port: env.PORT || 4000,
        host: '0.0.0.0',
    });
})();
