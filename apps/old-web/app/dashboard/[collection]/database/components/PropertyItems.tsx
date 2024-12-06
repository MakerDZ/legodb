import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import EditPopover from './EditPopover';
import { useCallback, useState } from 'react';
import { ColumnOrder, RowPropertyType } from '@prisma/client';
import ModalComponent from '@/components/ui/Model';
import { ModalFooter, useDisclosure } from '@nextui-org/modal';
import { Input } from '@nextui-org/input';
import toast from 'react-hot-toast';
import {
    deleteDatabaseColumnAction,
    updateDatabaseColumnNameAction,
} from '../actions/databaseActions';
import { useQueryClient } from '@tanstack/react-query';
import { useDatabaseCacheUpdate } from '@/hooks/cacheUpdate/useDatabaseCacheUpdate';
import ColumnIconType from '@/components/ui/ColumnIconType';
import { Button } from '@nextui-org/button';

const DraggableTableHeader = ({
    header,
    dbId,
}: {
    header: ColumnOrder;
    dbId: string;
}) => {
    const queryClient = useQueryClient();
    const { deleteDatabaseColumn, updateDatabaseColumnName } =
        useDatabaseCacheUpdate(queryClient);
    const [isOpenPopup, setIsOpenPopup] = useState<boolean>(false);
    const [loading, setisLoading] = useState(false);

    const {
        isOpen: isOpenDeleteModal,
        onOpen: onOpenDeleteModal,
        onClose: onCloseDeleteModal,
        onOpenChange: onOpenChangeDeleteModal,
    } = useDisclosure();
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useSortable({ id: header.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition: 'transform 0.1s ease-in-out',
        opacity: isDragging ? 0.8 : 1,
        whiteSpace: 'nowrap',
    };

    const handleDelete = useCallback(
        async (databaseColumnId: string, databaseColunmName: string) => {

            setisLoading(true);
            try {
                const databaseColumn = await deleteDatabaseColumnAction(
                    dbId,
                    databaseColumnId,
                    databaseColunmName
                );

                if (databaseColumn?.id) {
                    toast.success(
                        `Successfully deleted ${databaseColumn.name} collection`
                    );
                    deleteDatabaseColumn(databaseColumn);
                }
            } catch (error) {
                toast.error(
                    'Failed to delete the collection. Please try again.'
                );
            } finally {
                setisLoading(false);
                onCloseDeleteModal();
            }
        },
        [, onCloseDeleteModal]
    );

    const handleRename = async (id: string, name: string) => {
        try {
            const databaseColumn = await updateDatabaseColumnNameAction(
                id,
                name
            );
            if (databaseColumn.id) {
                toast.success(
                    `Successfully updated ${databaseColumn.name} column`
                );
                updateDatabaseColumnName(databaseColumn);
            }
        } catch (error) {
            toast.error('Failed to rename the column. Please try again.');
        }
    };

    return (
        <>
            <th
                ref={setNodeRef}
                style={style}
                className="border-b border-r border-[#E9E9E7] p-2 min-w-[150px]"
            >
                <EditPopover
                    inputValue={header.name}
                    deleteButton="Delete Property"
                    shownDeleteButton={!header.deafult}
                    deleteAction={() => {
                        onOpenChangeDeleteModal();
                        setIsOpenPopup(false);
                    }}
                    updateAction={(rename) => {
                        if (rename && rename !== header.name) {
                            handleRename(header.id, rename);
                        }
                    }}
                    isOpen={isOpenPopup}
                    setIsOpen={setIsOpenPopup}
                >
                    <div
                        {...attributes}
                        {...listeners}
                        className="flex items-center text-[#7D7C77] font-semibold space-x-1"
                    >
                        <ColumnIconType type={header.type as RowPropertyType} />
                        <h1>{header.name}</h1>
                    </div>
                </EditPopover>
            </th>

            <ModalComponent
                isOpen={isOpenDeleteModal}
                title="Are you sure you want to delete?"
                onOpenChange={onOpenChangeDeleteModal}
            >
                <div className="px-1 py-2 space-y-2">
                    <Input
                        disabled
                        type="text"
                        size="sm"
                        defaultValue={header.name}
                    />
                    <p className="text-sm">
                        This action cannot be undone. Do you still want to
                        delete this column? All of the data related to this
                        column "{header.name}" will be also deleted?
                    </p>
                </div>
                <ModalFooter>
                    <Button
                        className=" !bg-[#EB115D]"
                        color="danger"
                        isLoading={loading}
                        onPress={() => handleDelete(header.id, header.name)}
                    >
                        Delete
                    </Button>
                </ModalFooter>
            </ModalComponent>
        </>
    );
};

export default DraggableTableHeader;
