import { ColumnOrder, RowPropertyType } from '@prisma/client';

import ColumnIconType from '@/components/ui/ColumnIconType';
import { Tooltip } from '@nextui-org/react';

const PropertyDashItems = ({ header }: { header: ColumnOrder }) => {
    return (
        <>
            <th className="border-b border-r border-[#E9E9E7] p-2 w-[150px]">
                <div className="flex items-center text-[#7D7C77] w-[150px]  font-semibold space-x-1">
                    <ColumnIconType type={header.type as RowPropertyType} />
                    <Tooltip content={header.name}>
                        <h1 className="truncate">{header.name}</h1>
                    </Tooltip>
                </div>
            </th>
        </>
    );
};

export default PropertyDashItems;
