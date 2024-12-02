import { FastifyInstance } from 'fastify';
import { DatabaseController } from './db.controller';

const dbController = new DatabaseController();

export const databaseRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/database', dbController.getData);
};
