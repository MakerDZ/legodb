import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import logger from '../../shared/logger';
import db from '../../libs/prisma';
import { DataPhaser } from '../../utils/api-phaser';

interface databaseQuery {
    databaseName: string;
    page: number;
    limit: number;
}

const queryDatabase: FastifyPluginAsync = async (fastify) => {
    fastify.decorateRequest(
        'databaseQuery',
        async function ({ databaseName, page, limit }: databaseQuery) {
            try {
                const rowOrder = await db.database.findFirst({
                    where: {
                        name: databaseName,
                    },
                    select: {
                        id: true,
                        columnOrders: {
                            orderBy: {
                                order: 'asc',
                            },
                        },
                    },
                });

                if (!rowOrder) {
                    return null;
                }

                const totalCount = await db.rowOrder.count({
                    where: {
                        databaseId: rowOrder.id,
                    },
                });

                const topRowData = await db.rowOrder.findMany({
                    where: {
                        databaseId: rowOrder.id,
                    },
                    include: {
                        rowData: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                });

                const nestedData = await DataPhaser(topRowData);
                return {
                    data: nestedData,
                    metadata: {
                        currentPage: page,
                        itemsPerPage: limit,
                        totalPages: Math.ceil(totalCount / limit),
                        totalItems: totalCount,
                    },
                };
            } catch (err) {
                //logger.error(err);
                console.log(err);
                return null;
            }
        }
    );
};

export default fp(queryDatabase, {
    name: 'database-query-plugin',
});

declare module 'fastify' {
    interface FastifyRequest {
        databaseQuery: (params: databaseQuery) => Promise<{
            data: any;
            metadata: {
                currentPage: number;
                itemsPerPage: number;
                totalPages: number;
                totalItems: number;
            };
        } | null>;
    }
}
