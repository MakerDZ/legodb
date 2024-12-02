import 'dotenv/config';
import createServer from './libs/server';

(async () => {
    const server = await createServer();
    const address = await server.listen({ port: 4000, host: '0.0.0.0' });
})();
