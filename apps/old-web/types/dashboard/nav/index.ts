import { IEditProps } from '@/app/dashboard/[collection]/dashboard/components/InlineDBDashboard';

import { JsonValue } from '@prisma/client/runtime/library';

export interface Inav {
    name: string;
    id: string;
}

export interface IEditRow {
    isOpenModel: boolean;
    onOpenChange: (value: boolean) => void;
    onClose: () => void;
    editData: IEditProps;
    data: any;
}

export interface RelationLink {
    databaseID: string;
    datbaseName: string;
    columnID: string;
    columnName: string;
    type: 'one_to_one' | 'one_to_many';
}

export interface ColumnOrder {
    id: string;
    databaseId: string;
    name: string;
    type: string;
    relationLink?: RelationLink | null;
    deafult: boolean;
    order: number;
}

export interface Database {
    id: string;
    name: string;
    collectionId: string;
    columnOrders: ColumnOrder[];
}

interface RowData {
    name: string;
    id: string;
    type: any;
    content: JsonValue;
    rowOrderId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// Enriched RowData with RelationLink
export interface EnrichedRowData extends RowData {
    relationLink?: RelationLink | null;
    parsedContent?: string[] | null;
}

export interface IBooleanType {
    label: string;
    value: boolean;
}

export const BooleanTypes: IBooleanType[] = [
    {
        label: 'True',
        value: true,
    },
    {
        label: 'False',
        value: false,
    },
];

export interface FormData {
    [key: string]: string | number | boolean | Date | Array<string>; // Adjust based on expected types
}

export interface ICreateToken {
    isOpenModel: boolean;
    onOpenChange: (value: boolean) => void;
    onClose: () => void;
    DBName?: string;
    data: any;
}
