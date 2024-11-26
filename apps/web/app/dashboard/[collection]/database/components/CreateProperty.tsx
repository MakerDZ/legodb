import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '@nextui-org/modal';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { Select, SelectItem } from '@nextui-org/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { Spinner } from '@nextui-org/spinner';
import {
    createDatabaseColumn,
    TypeCreateDatabaseColumn,
} from '@/validation/database';
import { createDatabaseColumnAction } from '../actions/databaseActions';
import { Database } from '@prisma/client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useDatabaseCacheUpdate } from '@/hooks/cacheUpdate/useDatabaseCacheUpdate';
import useDatabaseData from '@/hooks/dataFetching/useDatabaseData';

export interface ModalProp {
    closeIt?: any;
    isOpen: any;
    onOpenChange: any;
    database: Database;
}

export const CreatePropertyModal = (prop: ModalProp) => {
    const { databaseData } = useDatabaseData();

    const [isRelationSelected, setRelationSelected] = useState(false);
    const [isDatabaaseLinked, setDatabaseLinked] = useState(false);

    const PropertyType = [
        'Text',
        'Attachment',
        'RichText',
        'Number',
        'Boolean',
        'Tags',
        'Calendar',
        'Relation',
    ];

    const queryClient = useQueryClient();
    const { addNewDatabaseColumn } = useDatabaseCacheUpdate(queryClient);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        setValue,
    } = useForm<TypeCreateDatabaseColumn>({
        resolver: zodResolver(createDatabaseColumn),
    });
    const selectedType = watch('type');
    const selectedDatabase = watch('relationLink');

    const { execute, result, status } = useAction(createDatabaseColumnAction);

    const onSubmit = async (values: TypeCreateDatabaseColumn) => {
        execute({
            ...values,
            databaseID: String(prop.database.id), // Ensure databaseID is a string
        });
        reset();
    };

    useEffect(() => {
        if (selectedType == 'Relation') {
            setRelationSelected(true);
        } else {
            setRelationSelected(false);
            setValue('relationLink', null, { shouldValidate: true });
        }

        if (selectedDatabase) {
            setDatabaseLinked(true);
        }
    }, [selectedType, selectedDatabase]);

    useEffect(() => {
        if (result.data?.status === 'success' && result.data.data) {
            addNewDatabaseColumn(result.data.data);
            toast.success(`${result.data.data.name} created successfully`);
            prop.closeIt();
            reset();
        }
    }, [result]);

    // Helper function to safely convert ID to string
    const safeToString = (value: any): string => {
        if (typeof value === 'symbol') {
            return value.toString();
        }
        if (value === null || value === undefined) {
            return '';
        }
        return String(value);
    };

    return (
        <Modal
            placement="center"
            isOpen={prop.isOpen}
            onOpenChange={prop.onOpenChange}
            onClose={prop.closeIt}
        >
            <ModalContent>
                {(onClose) => (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <ModalHeader className="flex flex-col gap-1">
                            Create New Property
                        </ModalHeader>
                        <ModalBody className="space-y-3">
                            <Input
                                {...register('name')}
                                type="text"
                                label="Property Name"
                                placeholder="Name Your Property"
                            />
                            <Select
                                {...register('type')}
                                label="Property Type"
                                placeholder="Select Property Type"
                            >
                                {PropertyType.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </Select>
                            {isRelationSelected && databaseData && (
                                <>
                                    <Select
                                        label="Link To Other Database"
                                        placeholder="Select Database"
                                        onChange={(e) => {
                                            const databaseId = safeToString(
                                                e.target.value
                                            );

                                            if (!databaseId) {
                                                setValue('relationLink', null, {
                                                    shouldValidate: true,
                                                });
                                                setDatabaseLinked(false);
                                                return;
                                            }

                                            const selectedDatabase =
                                                databaseData.find(
                                                    (db) =>
                                                        safeToString(db.id) ===
                                                        databaseId
                                                );
                                            if (selectedDatabase) {
                                                setValue(
                                                    'relationLink.databaseID',
                                                    safeToString(
                                                        selectedDatabase.id
                                                    ),
                                                    {
                                                        shouldValidate: true,
                                                    }
                                                );
                                                setValue(
                                                    'relationLink.datbaseName',
                                                    selectedDatabase.name,
                                                    {
                                                        shouldValidate: true,
                                                    }
                                                );
                                            }
                                        }}
                                    >
                                        {databaseData
                                            .filter(
                                                (database) =>
                                                    safeToString(
                                                        database.id
                                                    ) !==
                                                    safeToString(
                                                        prop.database.id
                                                    )
                                            )
                                            .map((database) => (
                                                <SelectItem
                                                    key={safeToString(
                                                        database.id
                                                    )}
                                                    value={safeToString(
                                                        database.id
                                                    )}
                                                >
                                                    {database.name}
                                                </SelectItem>
                                            ))}
                                    </Select>
                                </>
                            )}

                            {isDatabaaseLinked && databaseData && (
                                <Select
                                    className="flex-1"
                                    label="Link To Property of Database "
                                    placeholder="Select Property (Text Type for Visualization Only)"
                                    onChange={(e) => {
                                        // Ensure e.target.value is properly typed and handled
                                        const columnId = e?.target?.value
                                            ? safeToString(e.target.value)
                                            : '';

                                        const filteredDb = databaseData.filter(
                                            (db) =>
                                                safeToString(db.id) ===
                                                safeToString(
                                                    selectedDatabase?.databaseID
                                                )
                                        )[0];

                                        const columnData =
                                            filteredDb?.columnOrders?.find(
                                                (column) =>
                                                    safeToString(column.id) ===
                                                    columnId
                                            );

                                        if (columnData) {
                                            setValue(
                                                'relationLink.columnID',
                                                columnId,
                                                {
                                                    shouldValidate: true,
                                                }
                                            );
                                            setValue(
                                                'relationLink.columnName',
                                                columnData.name,
                                                {
                                                    shouldValidate: true,
                                                }
                                            );
                                        }
                                    }}
                                >
                                    {databaseData
                                        .filter(
                                            (db) =>
                                                safeToString(db.id) ===
                                                safeToString(
                                                    selectedDatabase?.databaseID
                                                )
                                        )[0]
                                        ?.columnOrders?.filter(
                                            (column) => column.type === 'Text'
                                        )
                                        ?.map((column) => (
                                            <SelectItem
                                                key={safeToString(column.id)}
                                                value={safeToString(column.id)}
                                            >
                                                {column.name}
                                            </SelectItem>
                                        ))}
                                </Select>
                            )}

                            {/* Is the relation was multi select or single select */}
                            {isDatabaaseLinked && databaseData && (
                                <Select
                                    {...register('relationLink.type')}
                                    label="Relationship Type"
                                    placeholder="Select Database Relationship Type"
                                >
                                    {['one_to_one', 'one_to_many'].map(
                                        (value) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {value}
                                            </SelectItem>
                                        )
                                    )}
                                </Select>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                type="submit"
                                className={`bg-[#0A99FE]`}
                                color="primary"
                                disabled={
                                    isSubmitting || status === 'executing'
                                }
                            >
                                {status === 'executing' ? (
                                    <Spinner color="warning" size="sm" />
                                ) : (
                                    'Create'
                                )}
                            </Button>
                        </ModalFooter>
                    </form>
                )}
            </ModalContent>
        </Modal>
    );
};