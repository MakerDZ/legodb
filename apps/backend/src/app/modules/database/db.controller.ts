import { FastifyReply, FastifyRequest } from 'fastify';

export class DatabaseController {
    constructor() {}

    async getData(request: FastifyRequest, reply: FastifyReply) {
        try {
            const query = request.query as { page?: string; limit?: string };
            const page = parseInt(query.page || '1', 10);
            const limit = parseInt(query.limit || '10', 10);

            const token = request.headers.authorization?.replace('Bearer ', '');

            // Check if the token is missing
            if (!token) {
                return reply.status(401).send({
                    success: false,
                    message: 'Authorization token is missing.',
                });
            }

            // Validate the token and fetch database access information
            const database = await request.validateDatabaseAccess(token);

            if (!database) {
                return reply.status(403).send({
                    success: false,
                    message: 'Invalid token. Access denied.',
                });
            }

            const data = await request.databaseQuery({
                databaseName: database.tableAccess,
                page,
                limit,
            });

            // Successful response with access information
            return reply.status(200).send({
                success: true,
                message: 'Database access verified successfully.',
                data,
            });
        } catch (error: any) {
            // Handle unexpected errors
            return reply.status(500).send({
                success: false,
                message: 'An unexpected error occurred.',
                error: error.message,
            });
        }
    }
}
