import { ColumnOrder } from '@prisma/client';
import React from 'react';

interface IBodyDisplay {
    id: string;
    data: ColumnOrder[];
    method: 'CREATE' | 'PUT' | 'DELETE';
}

function BodyDisplay({ id, data, method }: IBodyDisplay) {
    return (
        <div className="p-4 bg-gray-100 rounded-md font-mono text-sm">
            {method === 'DELETE' && (
                <>
                    <pre>{`"rowOrderId": ""`}</pre>
                </>
            )}
            {method !== 'DELETE' && (
                <>
                    {method === 'PUT' ? (
                        <>
                            <pre>{`"rowOrderId": ""`},</pre>
                        </>
                    ) : (
                        <>
                            {' '}
                            <pre>{`"databaseId": "${id}"`}</pre>
                        </>
                    )}
                    <pre>"rowData": [</pre>
                    <div className="ml-6">
                        {data
                            .filter((item) => item.name !== 'No')
                            .map((item, index) => (
                                <div key={index} className="ml-4">
                                    <pre>{`{`}</pre>
                                    <div className="ml-6">
                                        {method === 'PUT' && (
                                            <pre>
                                                <span className="font-bold">
                                                    "id":
                                                </span>{' '}
                                                "",
                                            </pre>
                                        )}

                                        <pre>
                                            <span className="font-bold">
                                                "name":
                                            </span>{' '}
                                            "{item.name}",
                                        </pre>
                                        <pre>
                                            <span className="font-bold">
                                                "type":
                                            </span>{' '}
                                            "{item.type}",
                                        </pre>
                                        <pre>
                                            <span className="font-bold">
                                                "content":
                                            </span>{' '}
                                            "123"
                                        </pre>
                                    </div>
                                    <pre>
                                        {index < data.length - 1 ? `},` : `}`}
                                    </pre>
                                </div>
                            ))}
                    </div>
                    <pre>]</pre>
                </>
            )}
        </div>
    );
}

export default BodyDisplay;
