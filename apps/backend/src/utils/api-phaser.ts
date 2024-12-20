import db from '../libs/prisma';

type ResponseType = {
    id: string;
    order: number;
    rowData: {
        id: string;
        name: string;
        type:
            | 'Number'
            | 'Text'
            | 'RichText'
            | 'Boolean'
            | 'Attachment'
            | 'Calendar'
            | 'Relation'
            | 'Tags';
        content: any;
        createdAt: Date;
        updatedAt: Date;
    }[];
}[];

const DataPhaser = async (responseData: unknown): Promise<any[]> => {
    const data = responseData as ResponseType;

    // Step 1: Batch Collect All Relation IDs
    const relationCollector = {
        rowIds: new Set<string>(),
        relationMappings: new Map<string, { name: string; content: any }[]>(),
    };

    // Collect all unique row IDs and track their context
    data.forEach(({ rowData }) => {
        rowData.forEach(({ type, name, content }) => {
            if (type === 'Relation') {
                const parsedContent = JSON.parse(content);
                parsedContent.forEach((row: any) => {
                    relationCollector.rowIds.add(row.rowID);
                });

                // Track how these relations are mapped
                if (!relationCollector.relationMappings.has(name)) {
                    relationCollector.relationMappings.set(name, []);
                }
                relationCollector.relationMappings
                    .get(name)!
                    .push({ name, content });
            }
        });
    });

    // Step 2: Batch Fetch All Related Rows
    const relatedRowsMap = new Map<string, any>();
    if (relationCollector.rowIds.size > 0) {
        const batchRelatedRows = await db.rowOrder.findMany({
            where: {
                id: { in: Array.from(relationCollector.rowIds) },
            },
            include: { rowData: true },
        });

        // Recursively process related rows
        const processedBatchRows = await DataPhaser(batchRelatedRows);
        processedBatchRows.forEach((row) => {
            relatedRowsMap.set(row.id, row);
        });
    }

    // Step 3: Process Original Data with Batched Related Rows
    const phaseredData = await Promise.all(
        data.map(async ({ id, order, rowData }) => {
            const dataSet: Record<string, any> = { id, order };

            await Promise.all(
                rowData.map(async ({ name, content, type }) => {
                    if (type === 'Relation') {
                        const relatedData = JSON.parse(content)
                            .map(
                                (row: any) =>
                                    relatedRowsMap.get(row.rowID) || null
                            )
                            .filter(Boolean);

                        dataSet[name] = relatedData;
                    } else {
                        dataSet[name] =
                            typeof content === 'string'
                                ? JSON.parse(content)
                                : content;
                    }
                })
            );

            return dataSet;
        })
    );

    return phaseredData;
};

export { DataPhaser };