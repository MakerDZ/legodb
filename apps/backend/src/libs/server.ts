import fastify from 'fastify';
import logger from '../shared/logger';
import { applicationInteractionRoutes } from '../app/routes/application';
import validateDatabase from '../app/plugins/db-validation';
import queryDatabase from '../app/plugins/db-query';

const createServer = async () => {
    const server = fastify({
        logger: logger,
    });

    server.get('/', async (request, reply) => {
        return reply.send({
            message: 'Oh, beautiful explorer, what are you looking for?',
        });
    });
    await server.register(validateDatabase);
    await server.register(queryDatabase);

    await server.register(applicationInteractionRoutes, {
        prefix: '/api/v1',
    });

    return server;
};

export default createServer;
