import { FastifyInstance } from 'fastify';
import { databaseRoutes } from '../modules/database/db.routes';

// These routes are necessary endpoints for interacting with the client application.
export const applicationInteractionRoutes = async (
    fastify: FastifyInstance
) => {
    fastify.register(databaseRoutes);
};
