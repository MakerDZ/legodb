import ModalComponent from '@/components/ui/Model';
import { Button } from '@nextui-org/button';
import { ModalFooter } from '@nextui-org/modal';

import React, { useEffect, useState } from 'react';
import { IEditProps } from './InlineDBDashboard';
import { generateSchemaForEdit } from '@/lib/helper';
import { RowData } from '@prisma/client';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@nextui-org/input';
import { Select, SelectItem } from '@nextui-org/react';
import useRelationRowData from '@/hooks/dataFetching/useRelationRowData';
import { editRowOrderAction } from '../action/dashboardAction';
import toast from 'react-hot-toast';

import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase';

import useRowTableRow from '@/hooks/dataFetching/useRowTableData';
import {
    BooleanTypes,
    Database,
    EnrichedRowData,
    IBooleanType,
    IEditRow,
    RelationLink,
} from '@/types/dashboard/nav';
import CreatableSelect from 'react-select/creatable';
import MarkdownEditor from '@uiw/react-markdown-editor';
import ImageUpload from '@/components/ui/UploadImage';
import { Editor } from 'novel-lightweight';

interface FormDatas {
    [key: string]: string | number | boolean | Date | Array<string>;
}

const EditTableRowModal = ({
    onOpenChange,
    isOpenModel,
    data,
    editData,
    onClose,
}: IEditRow) => {
    const [loading, setLoading] = useState(false);

    function enrichEditData(realData: Database, editData: IEditProps) {
        const relationMap: Record<string, RelationLink | null> = {};

        realData.columnOrders.forEach((column) => {
            if (column.type === 'Relation' && column.relationLink) {
                relationMap[column.name] = column.relationLink;
            }
        });

        const enrichedRowData: EnrichedRowData[] = editData.rowData.map(
            (row) => {
                // Only find the relation link if the type is 'Relation' and name matches
                const relationLink =
                    (row.type === 'Relation' && relationMap[row.name]) || null;

                // Parse the content only if it's a valid JSON string
                const parsedContent =
                    typeof row.content === 'string'
                        ? JSON.parse(row.content)
                        : null;

                return {
                    ...row,
                    relationLink, // Add the relation link if it exists
                    parsedContent, // Add the parsed content
                };
            }
        );

        realData.columnOrders.forEach((column) => {
            const existinEditData = editData.rowData.some(
                (row) => row.name === column.name
            );

            if (!existinEditData && column.name !== 'No') {
                const payloadData = {
                    content: JSON.stringify(''),
                    name: column.name,
                    type: column.type,
                    relationLink: column.relationLink,
                    rowOrderId: '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    id: '',
                };

                enrichedRowData.push(payloadData);
            }
        });

        return {
            rowData: enrichedRowData,
        };
    }

    const { rowRefetch } = useRowTableRow(data.id);

    const enrichedEditData = enrichEditData(data, editData);

    const schema = generateSchemaForEdit(data.columnOrders);

    const relationColumns = enrichedEditData.rowData.filter(
        (row: RowData) => row.type === 'Relation'
    );

    const defaultValues = enrichedEditData.rowData.reduce((acc, row) => {
        if (row.content === null || row.content === undefined) {
            acc[row.name] = ''; // Default to empty string or another fallback value
        } else if (
            typeof row.content === 'string' ||
            typeof row.content === 'number' ||
            typeof row.content === 'boolean'
        ) {
            acc[row.name] = row.content; // Assign valid types directly
        } else if (Array.isArray(row.content)) {
            // Ensure it's an array of strings for compatibility with input fields
            acc[row.name] = row.content.filter(
                (item) => typeof item === 'string'
            ) as string[];
        } else if (typeof row.content === 'object') {
            // Handle case where content is a JSON object but not an array
            acc[row.name] = JSON.stringify(row.content); // Convert object to string
        }
        return acc;
    }, {} as FormDatas);

    const relationData: any[] = relationColumns.map((row: EnrichedRowData) => {
        const { rowDataSelect, rowRefetch } = useRelationRowData(
            row.relationLink ? row.relationLink.databaseID : '',
            row.relationLink ? row.relationLink.columnName : ''
        );
        return { columnName: row.name, rowDataSelect, rowRefetch };
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        control,
        reset,
    } = useForm<FormDatas>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    useEffect(() => {
        if (enrichedEditData) {
            enrichedEditData.rowData.forEach((row) => {
                if (row.content !== null && row.content !== undefined) {
                    setValue(
                        row.name,
                        typeof row.content === 'string'
                            ? JSON.parse(row.content)
                            : ''
                    );
                }
            });
        }
    }, [editData]);

    const uploadImage = async (file: any) => {
        if (!file) return null;

        const storageRef = ref(storage, `TableRow/${file.name}`);
        try {
            const snapShot = await uploadBytes(storageRef, file);

            const downloadURl = await getDownloadURL(snapShot.ref);

            return downloadURl;
        } catch (error) {
            console.error('Image upload failed:', error);
            throw error;
        }
    };

    const onSubmit = async (formData: FormDatas) => {
        setLoading(true);
        try {
            const rowData = await Promise.all(
                enrichedEditData.rowData.map(async (row) => {
                    let contentValue = formData[row.name];

                    // Check if the row type is "Attachment"
                    if (row.type === 'Attachment' && contentValue) {
                        const imageUrl = await uploadImage(contentValue);
                        contentValue = String(imageUrl); // Convert the image URL to a string
                    }

                    return {
                        id: row.id,
                        content: contentValue,
                        name: row.name,
                        type: row.type,
                    };
                })
            );

            const payload = {
                rowOrderId: editData.id,
                order: editData.order,
                rowData: rowData,
                dbname: data.name,
            };

            await editRowOrderAction(payload);

            toast.success('success');
            rowRefetch();
            onClose();
            setLoading(false);
        } catch (error) {
            console.error('Failed to update row:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleClose = () => {
        onClose();
        reset();
    };

    const handleChange = (selectedOptions: any) => {
        return selectedOptions
            ? selectedOptions.map((option: any) => option.value)
            : [];
    };

    return (
        <ModalComponent
            isOpen={isOpenModel}
            largeSize
            title="Edit Table Row"
            onOpenChange={onOpenChange}
        >
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {data.columnOrders
                    .filter((column: EnrichedRowData) => column.name !== 'No')
                    .map((column: EnrichedRowData) => (
                        <div
                            key={column.id}
                            className="grid items-center space-x-3 "
                        >
                            <div className="grid grid-cols-2">
                                <label htmlFor={column.name}>
                                    {column.name}
                                </label>
                                {(() => {
                                    switch (column.type) {
                                        case 'Attachment':
                                            return (
                                                <Controller
                                                    control={control}
                                                    name={column.name}
                                                    render={({ field }) => (
                                                        <ImageUpload
                                                            name={field.name}
                                                            control={control}
                                                            image={
                                                                field.value !=
                                                                ''
                                                                    ? field.value
                                                                    : null
                                                            }
                                                        />
                                                    )}
                                                />
                                            );
                                        case 'RichText':
                                            return (
                                                <Controller
                                                    name={column.name}
                                                    control={control}
                                                    render={({
                                                        field: {
                                                            onChange,
                                                            value,
                                                        },
                                                        fieldState: { error },
                                                    }) => (
                                                        <div className="border-1 border-gray-300 border-solid rounded-lg">
                                                            <Editor
                                                                className="w-full p-0 m-0"
                                                                defaultValue={
                                                                    value.toString() ||
                                                                    ''
                                                                }
                                                                disableLocalStorage={
                                                                    true
                                                                }
                                                                onUpdate={(
                                                                    editor
                                                                ) => {
                                                                    const newContent =
                                                                        editor?.storage.markdown.getMarkdown() ||
                                                                        '';
                                                                    onChange(
                                                                        newContent
                                                                    );
                                                                }}
                                                                handleImageUpload={async (
                                                                    file
                                                                ) => {
                                                                    const imageUrl =
                                                                        await uploadImage(
                                                                            file
                                                                        );
                                                                    return imageUrl
                                                                        ? imageUrl
                                                                        : '';
                                                                }}
                                                            />
                                                            {error && (
                                                                <p className="text-red-500 text-sm">
                                                                    {
                                                                        error.message
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                />
                                            );
                                        case 'Number':
                                            return (
                                                <>
                                                    <Input
                                                        {...register(
                                                            column.name,
                                                            {
                                                                setValueAs: (
                                                                    v
                                                                ) =>
                                                                    v === ''
                                                                        ? undefined
                                                                        : Number(
                                                                              v
                                                                          ),
                                                            }
                                                        )}
                                                        type="number"
                                                        label={column.name}
                                                        fullWidth
                                                        defaultValue={
                                                            typeof column.content ===
                                                            'string'
                                                                ? column.content
                                                                : ''
                                                        }
                                                        color={
                                                            errors[column.name]
                                                                ? 'danger'
                                                                : 'default'
                                                        }
                                                    />
                                                    {errors[column.name]
                                                        ?.message && (
                                                        <p className="text-red-500 text-sm">
                                                            {String(
                                                                errors[
                                                                    column.name
                                                                ]?.message
                                                            )}
                                                        </p>
                                                    )}
                                                </>
                                            );
                                        case 'Text':
                                        case 'RichText':
                                            return (
                                                <>
                                                    <Input
                                                        {...register(
                                                            column.name
                                                        )}
                                                        type="text"
                                                        label={column.name}
                                                        fullWidth
                                                        color={
                                                            errors[column.name]
                                                                ? 'danger'
                                                                : 'default'
                                                        }
                                                    />
                                                    {errors[column.name]
                                                        ?.message && (
                                                        <p className="text-red-500 text-sm">
                                                            {String(
                                                                errors[
                                                                    column.name
                                                                ]?.message
                                                            )}
                                                        </p>
                                                    )}
                                                </>
                                            );
                                        case 'Boolean':
                                            return (
                                                <div>
                                                    <Select
                                                        {...register(
                                                            column.name
                                                        )}
                                                        label={column.name}
                                                        className="w-full"
                                                        color={
                                                            errors[column.name]
                                                                ? 'danger'
                                                                : 'default'
                                                        }
                                                    >
                                                        {BooleanTypes.map(
                                                            (
                                                                item: IBooleanType
                                                            ) => (
                                                                <SelectItem
                                                                    key={
                                                                        item.label
                                                                    }
                                                                    value={
                                                                        item.label
                                                                    }
                                                                >
                                                                    {item.label}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </Select>

                                                    {errors[column.name]
                                                        ?.message && (
                                                        <p className="text-red-500 text-sm">
                                                            {String(
                                                                errors[
                                                                    column.name
                                                                ]?.message
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        case 'Calendar':
                                            return (
                                                <div>
                                                    <Input
                                                        {...register(
                                                            column.name
                                                        )}
                                                        type="date"
                                                        label={column.name}
                                                        fullWidth
                                                        defaultValue={
                                                            typeof column.content ===
                                                            'string'
                                                                ? column.content
                                                                : ''
                                                        }
                                                        required
                                                        color={
                                                            errors[column.name]
                                                                ? 'danger'
                                                                : 'default'
                                                        }
                                                    />
                                                    {errors[column.name]
                                                        ?.message && (
                                                        <p className="text-red-500 text-sm">
                                                            {String(
                                                                errors[
                                                                    column.name
                                                                ]?.message
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        case 'Relation':
                                            let one_to_one_or_many =
                                                column.relationLink?.type;

                                            const relatedData =
                                                relationData.find(
                                                    (rel) =>
                                                        rel.columnName ===
                                                        column.name
                                                );

                                            return (
                                                <div>
                                                    <Controller
                                                        name={column.name}
                                                        control={control}
                                                        defaultValue={[]}
                                                        render={({
                                                            field: {
                                                                onChange,
                                                                value,
                                                            },
                                                        }) => (
                                                            <Select
                                                                label={
                                                                    column.name
                                                                }
                                                                selectionMode={
                                                                    one_to_one_or_many ==
                                                                    'one_to_many'
                                                                        ? 'multiple'
                                                                        : 'single'
                                                                }
                                                                selectedKeys={
                                                                    typeof value !==
                                                                    'string'
                                                                        ? //@ts-ignore
                                                                          value.map(
                                                                              (
                                                                                  item: any
                                                                              ) =>
                                                                                  item.selectedValue
                                                                          )
                                                                        : []
                                                                }
                                                                className="w-full"
                                                                onSelectionChange={(
                                                                    selectedKeys
                                                                ) => {
                                                                    const selectedArray =
                                                                        Array.from(
                                                                            selectedKeys
                                                                        ).map(
                                                                            (
                                                                                selected: any
                                                                            ) => {
                                                                                if (
                                                                                    typeof selected ==
                                                                                    'string'
                                                                                ) {
                                                                                    return selected;
                                                                                } else {
                                                                                    return selected.selectedValue;
                                                                                }
                                                                            }
                                                                        );

                                                                    // i wanna get the rowID of that select item.
                                                                    const selectedValue =
                                                                        selectedArray.map(
                                                                            (
                                                                                selected
                                                                            ) => {
                                                                                const selectedRow =
                                                                                    relatedData.rowDataSelect.find(
                                                                                        (
                                                                                            row: any
                                                                                        ) =>
                                                                                            JSON.parse(
                                                                                                row.content
                                                                                            ) ==
                                                                                            selected
                                                                                    );
                                                                                console.log(
                                                                                    selectedRow
                                                                                );

                                                                                return {
                                                                                    rowID: selectedRow.rowOrderId,
                                                                                    selectedValue:
                                                                                        selected,
                                                                                };
                                                                            }
                                                                        );
                                                                    onChange(
                                                                        selectedValue
                                                                    );
                                                                }}
                                                                color={
                                                                    errors[
                                                                        column
                                                                            .name
                                                                    ]
                                                                        ? 'danger'
                                                                        : 'default'
                                                                }
                                                            >
                                                                {(
                                                                    relatedData?.rowDataSelect ||
                                                                    []
                                                                ).map(
                                                                    (
                                                                        item: any
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={JSON.parse(
                                                                                item?.content
                                                                            )}
                                                                            value={
                                                                                item.content
                                                                            }
                                                                        >
                                                                            {typeof item.content ===
                                                                            'string'
                                                                                ? JSON.parse(
                                                                                      item.content
                                                                                  )
                                                                                : 'N/A'}
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </Select>
                                                        )}
                                                    />
                                                    {errors[column.name]
                                                        ?.message && (
                                                        <p className="text-red-500 text-sm">
                                                            {String(
                                                                errors[
                                                                    column.name
                                                                ]?.message
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            );

                                        case 'Tags':
                                            return (
                                                <div>
                                                    <Controller
                                                        name={column.name}
                                                        control={control}
                                                        render={({
                                                            field: {
                                                                onChange,
                                                                value,
                                                            },
                                                        }) => (
                                                            <CreatableSelect
                                                                isMulti
                                                                isClearable
                                                                // Ensure value is an array and transform it for CreatableSelect
                                                                value={
                                                                    Array.isArray(
                                                                        value
                                                                    )
                                                                        ? value.map(
                                                                              (
                                                                                  tag
                                                                              ) => ({
                                                                                  value: tag,
                                                                                  label: tag,
                                                                              })
                                                                          )
                                                                        : []
                                                                }
                                                                onChange={(
                                                                    selectedOptions
                                                                ) => {
                                                                    const tags =
                                                                        handleChange(
                                                                            selectedOptions
                                                                        ); // Get the array of tag values
                                                                    onChange(
                                                                        tags
                                                                    ); // Update React Hook Form state with the array of strings
                                                                }}
                                                                placeholder="Add tags..."
                                                            />
                                                        )}
                                                    />
                                                    {errors[column.name]
                                                        ?.message && (
                                                        <p className="text-red-500 text-sm">
                                                            {String(
                                                                errors[
                                                                    column.name
                                                                ]?.message
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        default:
                                            return null;
                                    }
                                })()}
                            </div>
                        </div>
                    ))}

                <ModalFooter>
                    <Button
                        className="!bg-[#0D98FE]"
                        isLoading={loading}
                        isDisabled={loading}
                        color="primary"
                        type="submit"
                    >
                        Edit
                    </Button>
                    <Button onClick={handleClose}>Cancel</Button>
                </ModalFooter>
            </form>
        </ModalComponent>
    );
};

export default EditTableRowModal;
