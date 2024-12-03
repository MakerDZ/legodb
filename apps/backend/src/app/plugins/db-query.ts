import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { performance } from 'perf_hooks';
import { LRUCache as LRU } from 'lru-cache';
import db from '../../libs/prisma';
import { DataPhaser } from '../../utils/api-phaser';

// Create a cache with a reasonable configuration
const queryCache = new LRU<string, any>({
    max: 100, // Cache up to 100 unique queries
    ttl: 1000 * 60 * 5, // Cache for 5 minutes
});

interface DatabaseQuery {
    databaseName: string;
    page: number;
    limit: number;
}

// Extract common database fetch logic
const fetchDatabaseData = async (
    databaseName: string,
    page: number,
    limit: number
) => {
    // Create a unique cache key based on query parameters
    const cacheKey = JSON.stringify({ databaseName, page, limit });

    // Check cache first
    const cachedResult = queryCache.get(cacheKey);
    if (cachedResult) {
        console.log('Returning cached result');
        return cachedResult;
    }

    // Parallel database queries for better performance
    const [database, totalCount, topRowData] = await Promise.all([
        db.database.findFirst({
            where: { name: databaseName },
            select: {
                id: true,
                columnOrders: {
                    orderBy: { order: 'asc' },
                },
            },
        }),
        db.rowOrder.count({
            where: {
                databaseId: (
                    await db.database.findFirst({
                        where: { name: databaseName },
                        select: { id: true },
                    })
                )?.id,
            },
        }),
        db.rowOrder.findMany({
            where: {
                databaseId: (
                    await db.database.findFirst({
                        where: { name: databaseName },
                        select: { id: true },
                    })
                )?.id,
            },
            include: { rowData: true },
            orderBy: { order: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
    ]);

    if (!database) {
        return null;
    }

    // Measure DataPhaser processing time
    const startTime = performance.now();
    const nestedData = await DataPhaser(topRowData);
    const endTime = performance.now();

    const result = {
        data: nestedData,
        metadata: {
            currentPage: page,
            itemsPerPage: limit,
            totalPages: Math.ceil(totalCount / limit),
            totalItems: totalCount,
            processingTime: endTime - startTime,
        },
    };

    // Cache the result
    queryCache.set(cacheKey, result);

    console.log(`DataPhaser Processing Time: ${endTime - startTime}ms`);
    return result;
};

const queryDatabase: FastifyPluginAsync = async (fastify) => {
    fastify.decorateRequest(
        'databaseQuery',
        async function ({ databaseName, page, limit }: DatabaseQuery) {
            try {
                return await fetchDatabaseData(databaseName, page, limit);
            } catch (err) {
                console.error('Database Query Error:', err);
                return null;
            }
        }
    );
};

export default fp(queryDatabase, {
    name: 'database-query-plugin',
});

// Type declaration remains the same
declare module 'fastify' {
    interface FastifyRequest {
        databaseQuery: (params: DatabaseQuery) => Promise<{
            data: any;
            metadata: {
                currentPage: number;
                itemsPerPage: number;
                totalPages: number;
                totalItems: number;
                processingTime?: number;
            };
        } | null>;
    }
}