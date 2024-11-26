'use client';
import React, { useCallback, useEffect, useState } from 'react';
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    horizontalListSortingStrategy,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import { CreatePropertyModal } from './CreateProperty';
import { ModalFooter, useDisclosure } from '@nextui-org/modal';
import { LuTable } from 'react-icons/lu';
import EditPopover from './EditPopover';
import DraggableTableHeader from './PropertyItems';
import { ColumnOrder, Database } from '@prisma/client';
import ModalComponent from '@/components/ui/Model';
import toast from 'react-hot-toast';
import { Input } from '@nextui-org/input';
import {
    deleteDatabaseAction,
    updateDatabaseColumnOrderAction,
    updateDatabaseNameAction,
} from '../actions/databaseActions';
import { useQueryClient } from '@tanstack/react-query';
import { useDatabaseCacheUpdate } from '@/hooks/cacheUpdate/useDatabaseCacheUpdate';
import debounce from 'lodash.debounce';
import { Button } from '@nextui-org/button';

interface InlineDBProp {
    data: Database & {
        columnOrders: ColumnOrder[];
    };
}

const InlineDB = ({ data }: InlineDBProp) => {
    const queryClient = useQueryClient();
    const { deleteDatabase, updateDatabase } =
        useDatabaseCacheUpdate(queryClient);
    const [isOpenDeletePopup, setIsOpenDeletePopup] = useState<boolean>(false);
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const {
        isOpen: isOpenDeleteModal,
        onOpen: onOpenDeleteModal,
        onClose: onCloseDeleteModal,
        onOpenChange: onOpenChangeDeleteModal,
    } = useDisclosure();
    const [loading, setisLoading] = useState(false);

    const initialHeaders: ColumnOrder[] = data.columnOrders;
    const [headers, setHeaders] = useState(initialHeaders);

    useEffect(() => {
        setHeaders(data.columnOrders);
    }, [data.columnOrders]);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = headers.findIndex((item) => item.id === active.id);
            const newIndex = headers.findIndex((item) => item.id === over.id);
            const sortedColumn = arrayMove(headers, oldIndex, newIndex);

            const updatedColumns = sortedColumn.map((column, index) => ({
                ...column,
                order: index,
            }));
            setHeaders(updatedColumns);

            // we need to debounce
            handleSortedOrder(updatedColumns);
        }
    };

    const detectSensor = () => {
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
        return isTouchDevice ? TouchSensor : PointerSensor;
    };

    const sensors = useSensors(
        useSensor(detectSensor(), {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleSortedOrder = useCallback(
        debounce(async (columns: ColumnOrder[]) => {
            try {
                const updatedColumns =
                    await updateDatabaseColumnOrderAction(columns);

                if (updatedColumns) {
                    toast.success('Column orders updated successfully.');
                }
            } catch (error) {
                toast.error(
                    'Failed to update column orders. Please try again.'
                );
            }
        }, 500),
        []
    );

    const handleDelete = useCallback(
        async (databaseId: string) => {
            setisLoading(true);
            try {
                const database = await deleteDatabaseAction(databaseId);
                if (database.id) {
                    toast.success(
                        `Successfully deleted ${database.name} collection`
                    );

                    deleteDatabase(database);
                       onCloseDeleteModal();
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
        [deleteDatabase, onCloseDeleteModal]
    );

    const handleRename = async (id: string, name: string) => {
        try {
            const database = await updateDatabaseNameAction(id, name);
            if (database.id) {
                toast.success(
                    `Successfully updated ${database.name} collection`
                );
            }
            updateDatabase(database);
        } catch (error) {
            toast.error('Failed to rename the collection. Please try again.');
        } finally {
            onClose();
        }
    };

    return (
        <>
            <div>
                <div className="w-48">
                    <EditPopover
                        shownDeleteButton={true}
                        inputValue={data.name}
                        deleteButton="Delete Database"
                        deleteAction={() => {
                            onOpenChangeDeleteModal();
                            setIsOpenDeletePopup(false);
                        }}
                        updateAction={(rename) => {
                            if (rename && rename !== data.name) {
                                handleRename(data.id, rename);
                            }
                        }}
                        isOpen={isOpenDeletePopup}
                        setIsOpen={setIsOpenDeletePopup}
                    >
                        <div className="flex flex-row items-center text-[#7D7C77] text-base font-semibold py-3 space-x-2">
                            <LuTable />
                            <h1>{data.name}</h1>
                        </div>
                    </EditPopover>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="overflow-x-auto overflow-y-hidden rounded-lg flex flex-row">
                        <table className="table-auto border-collapse border-r border-t border-[#E9E9E7]">
                            <thead>
                                <SortableContext
                                    items={headers.map((header) => header.id)}
                                    strategy={horizontalListSortingStrategy}
                                >
                                    <tr className="overflow-x-auto">
                                        {headers.map((header) => (
                                            <DraggableTableHeader
                                                dbId={data.id}
                                                key={header.id}
                                                header={header}
                                            />
                                        ))}
                                    </tr>
                                </SortableContext>
                            </thead>
                        </table>
                        <button
                            onClick={onOpen}
                            className="flex items-center text-[#7D7C77] font-semibold px-4 text-lg hover:cursor-pointer"
                        >
                            +
                        </button>
                    </div>
                </DndContext>
            </div>

            <CreatePropertyModal
                isOpen={isOpen}
                closeIt={onClose}
                onOpenChange={onOpenChange}
                database={data}
            />

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
                        defaultValue={data.name}
                    />
                    <p className="text-sm">
                        This action cannot be undone. Do you still want to
                        delete the database "{data.name}"?
                    </p>
                </div>

                <ModalFooter>
                    <Button
                        className=" !bg-[#EB115D]"
                        isLoading={loading}
                        color="danger"
                        onPress={() => handleDelete(data.id)}
                    >
                        Delete
                    </Button>
                </ModalFooter>
            </ModalComponent>
        </>
    );
};

export default InlineDB;
