'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ColumnOrder, Database, RowData, RowOrder } from '@prisma/client';
import PropertyDashItems from './PropertyDasbItems';
import { Button } from '@nextui-org/button';
import InlineDataTable from './InlineDataTable';
import CreateTableRowModal from './CreateTableRowModal';
import { ModalFooter, useDisclosure } from '@nextui-org/modal';
import useRowTableRow from '@/hooks/dataFetching/useRowTableData';
import ModalComponent from '@/components/ui/Model';
import toast from 'react-hot-toast';
import {
    deleteRowOrderAction,
    updaterDashboardRowOrderAction,
} from '../action/dashboardAction';
import { useRowTableCacheUpdate } from '@/hooks/cacheUpdate/useRowTableCacheUpdate';
import { useQueryClient } from '@tanstack/react-query';
import EditTableRowModal from './EditTableRowModal';
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import debounce from 'lodash.debounce';

export interface InlineDBProp {
    data: Database & {
        columnOrders: ColumnOrder[];
    };
}

export interface IEditProps {
    databaseId: string;
    id: string;
    order: number;
    rowData: RowData[];
}

export interface IRowOrder extends RowOrder {
    rowData: RowData[];
}

const InlineDBDashboard = ({ data }: InlineDBProp) => {
    const initialHeaders = data.columnOrders || [];
    const [headers, setHeaders] = useState<ColumnOrder[]>(initialHeaders);
    const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
    const [isDeleteLoad, setIsdeleteLoad] = useState(false);
    const [editRowData, setEditRowData] = useState<IEditProps | null>(null);

    // Fetch row data
    const { rowData, rowRefetch } = useRowTableRow(data.id);

    const filteredRowData = useMemo(() => {
        return rowData || [];
    }, [rowData]);

    const [rowDataHeaders, setrowDataHeaders] = useState<IRowOrder[]>([]);

    useEffect(() => {
        if (filteredRowData.length > 0) {
            setrowDataHeaders(filteredRowData);
        }
    }, [filteredRowData]);

    // Modal controls
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isDeleteModalOpen,
        onOpen: onDeleteOpen,
        onClose: onDeleteClose,
    } = useDisclosure();

    const {
        isOpen: isEditModalOpen,
        onOpen: onEditOpen,
        onClose: onEditClose,
    } = useDisclosure();

    const queryClient = useQueryClient();
    const { deleteRowTableData } = useRowTableCacheUpdate(data.id, queryClient);

    // Update headers if data changes
    useEffect(() => {
        setHeaders(data.columnOrders);
    }, [data.columnOrders]);

    // Memoize filtered row data

    // Handle opening the delete modal with the row ID
    const handleDeleteModal = (id: string) => {
        setDeleteRowId(id);
        onDeleteOpen();
    };

    const handleEditModal = (data: IEditProps) => {
        setEditRowData(data);
        onEditOpen();
    };

    // Handle actual deletion
    const handleDeleteRow = async () => {
        setIsdeleteLoad(true);
        if (deleteRowId) {
            try {
                const deletedRowOrder = await deleteRowOrderAction(
                    deleteRowId,
                    data.name
                );
                if (deletedRowOrder.id) {
                    toast.success('Row deleted successfully.');
                    deleteRowTableData(deletedRowOrder);
                }
            } catch (error) {
                toast.error(
                    'Failed to delete the row order. Please try again.'
                );
            } finally {
                setDeleteRowId(null);
                setIsdeleteLoad(false);
                onDeleteClose();
            }
        }
    };

    // Render headers
    const renderHeaders = () => (
        <tr className="border-t">
            {headers.map((header) => (
                <PropertyDashItems key={header.id} header={header} />
            ))}
        </tr>
    );
    const handleSortedOrder = useCallback(
        debounce(async (row: IRowOrder[]) => {
            try {
                const result = await updaterDashboardRowOrderAction(row);

                if (Array.isArray(result)) {
                    toast.success('Row order updated successfully');
                } else if (result.error) {
                    toast.error(
                        result.error ||
                            'Failed to update row orders. Please try again.'
                    );
                }
            } catch (error) {
                toast.error('Failed to update row orders. Please try again.');
            }
        }, 500),
        []
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = rowDataHeaders.findIndex(
                (item) => item.id === active.id
            );
            const newIndex = rowDataHeaders.findIndex(
                (item) => item.id === over.id
            );
            const sortedColumn = arrayMove(rowDataHeaders, oldIndex, newIndex);

            const updatedColumns = sortedColumn.map((column, index) => ({
                ...column,
                order: index,
            }));
            setrowDataHeaders(updatedColumns);

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

    useEffect(() => {
        rowRefetch();
    }, [data]);

    const reorderRowData = (rowData: IRowOrder[], order: ColumnOrder[]) => {
        order.filter((col) => col.name !== 'No');
        const nameOrder = order.map((col) => col.name);

        return rowData.map((row) => ({
            ...row,
            rowData: row.rowData.sort(
                (a, b) => nameOrder.indexOf(a.name) - nameOrder.indexOf(b.name)
            ),
        }));
    };

    useEffect(() => {}, [rowData]);

    const reorderedData = reorderRowData(rowDataHeaders, data.columnOrders);

    // Render row data
    const renderRowData = () => (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={rowDataHeaders.map((row) => row.id)}
                strategy={verticalListSortingStrategy}
            >
                {rowData?.length === reorderedData.length &&
                    reorderedData.map((item) => (
                        <div
                            key={item.id}
                            className="flex w-full overflow-auto flex-row justify-between"
                        >
                            <InlineDataTable data={item} />
                            <div className="flex flex-row space-x-4">
                                <Button
                                    className=" !bg-[#0D98FE]"
                                    onPress={() => handleEditModal(item)}
                                    size="sm"
                                >
                                    Edit
                                </Button>
                                <Button
                                    className=" !bg-[#EB0253]"
                                    color="danger"
                                    onPress={() => handleDeleteModal(item.id)}
                                    size="sm"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
            </SortableContext>
        </DndContext>
    );

    const isNewButtonDisabled = useMemo(() => {
        return (
            data.columnOrders.length === 1 && data.columnOrders[0].name === 'No'
        );
    }, [data.columnOrders]);

    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto overflow-y-hidden rounded-lg flex flex-row w-full justify-between">
                <table className="table-auto border-collapse border-l border-[#E9E9E7]">
                    <thead>{renderHeaders()}</thead>
                </table>
                <Button
                    className=" !bg-[#0D98FE]"
                    isDisabled={isNewButtonDisabled}
                    onPress={onOpen}
                    color="primary"
                >
                    New {data.name}
                </Button>
            </div>

            <CreateTableRowModal
                onOpenChange={onClose}
                DBName={data.name}
                isOpenModel={isOpen}
                onClose={onClose}
                data={data}
            />

            {editRowData && (
                <EditTableRowModal
                    onOpenChange={onEditClose}
                    isOpenModel={isEditModalOpen}
                    onClose={onEditClose}
                    editData={editRowData}
                    data={data}
                />
            )}

            <div className="mt-2">{renderRowData()}</div>

            <ModalComponent
                isOpen={isDeleteModalOpen}
                title="Are you sure you want to delete?"
                onOpenChange={onDeleteClose}
            >
                <ModalFooter>
                    <Button
                        className=" !bg-[#EB115D]"
                        isLoading={isDeleteLoad}
                        isDisabled={isDeleteLoad}
                        onPress={handleDeleteRow}
                        color="danger"
                    >
                        Delete
                    </Button>
                    <Button onPress={onDeleteClose}>Cancel</Button>
                </ModalFooter>
            </ModalComponent>
        </div>
    );
};

export default InlineDBDashboard;
