import { prisma } from '@/lib/prisma';

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

    try {
        // Use Promise.all to handle asynchronous mapping
        const phaseredData = await Promise.all(
            data.map(async ({ id, order, rowData }) => {
                const dataSet: Record<string, any> = { id, order };

                await Promise.all(
                    rowData.map(async ({ name, content, type }) => {
                        if (type === 'Relation') {
                            // Handle each related "row" within the Relation
                            const relatedData = await Promise.all(
                                JSON.parse(content).map(async (row: any) => {
                                    try {
                                        const rowData =
                                            await prisma.rowOrder.findMany({
                                                where: { id: row.rowID }, // Fetch data using rowID
                                                include: { rowData: true },
                                            });

                                        // Apply DataPhaser recursively to the related row data
                                        const phaseredRowData =
                                            await DataPhaser(rowData);

                                        // You can also attach the 'selectedValue' to the related data
                                        return {
                                            ...phaseredRowData[0], // Assuming only one related row is returned
                                        };
                                    } catch (error) {
                                        console.error(
                                            `Error processing related row data for ${name}:`,
                                            error
                                        );
                                        return {
                                            error: 'Error processing related row data',
                                        };
                                    }
                                })
                            );
                            dataSet[name] = relatedData;
                        } else {
                            // Parse content only if it's a string
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
    } catch (error) {
        console.error('Error in DataPhaser:', error);
        throw error;
    }
};

export { DataPhaser };