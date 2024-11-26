import { Snippet } from '@nextui-org/snippet';
import React from 'react';
import { Accordion, AccordionItem, Chip, Code } from '@nextui-org/react';
import useRowTableRow from '@/hooks/dataFetching/useRowTableData';
import { ColumnOrder, RowData } from '@prisma/client';
import BodyDisplay from './BodyDisplay';

interface IAPICard {
    name: string;
    id: string;
    collection: string;
    columnOrders: ColumnOrder[];
}

interface APISectionProps {
    method: 'GET' | 'CREATE' | 'PUT' | 'DELETE';
    url: string;
    color: 'primary' | 'secondary' | 'success' | 'danger';
    content: ColumnOrder[];
    id: string;
}

// Reusable component for each API method section
const APISection = ({ method, url, color, content, id }: APISectionProps) => (
    <div className="w-[500px]">
        <Chip color={color} variant="dot">
            {method}
        </Chip>
        <Accordion className="w-full">
            <AccordionItem
                key={method}
                aria-label={method.toLowerCase()}
                title={
                    <div className="flex flex-col w-full space-y-2">
                        <Snippet
                            variant="flat"
                            className="w-full"
                            symbol={method}
                            color={color}
                        >
                            {url}
                        </Snippet>
                    </div>
                }
            >
                <div>
                    {method !== 'GET' && (
                        <Code className="w-full p-4 bg-gray-100 rounded-md">
                            <BodyDisplay
                                method={method}
                                id={id}
                                data={content}
                            />
                        </Code>
                    )}
                </div>
            </AccordionItem>
        </Accordion>
    </div>
);

const APICard = ({ name, collection, columnOrders, id }: IAPICard) => {
    const url = `/api/v1/database/${collection}/${name}`;

    return (
        <div className="flex flex-col space-y-4">
            <APISection
                method="GET"
                url={url}
                color="primary"
                id={id}
                content={columnOrders}
            />
            <APISection
                method="CREATE"
                url={url}
                id={id}
                color="secondary"
                content={columnOrders}
            />
            <APISection
                method="PUT"
                url={url}
                color="success"
                id={id}
                content={columnOrders}
            />
            <APISection
                method="DELETE"
                url={url}
                color="danger"
                id={id}
                content={columnOrders}
            />
        </div>
    );
};

export default APICard;
