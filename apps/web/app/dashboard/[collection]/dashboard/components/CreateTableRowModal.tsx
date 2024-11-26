import ModalComponent from '@/components/ui/Model';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { ModalFooter } from '@nextui-org/modal';
import { Select, SelectItem } from '@nextui-org/select';
import { Controller, useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createRowOrder } from '../action/dashboardAction';
import { useRowTableCacheUpdate } from '@/hooks/cacheUpdate/useRowTableCacheUpdate';
import useRelationRowData from '@/hooks/dataFetching/useRelationRowData';
import { generateSchema } from '@/lib/helper';
import { useEffect, useState } from 'react';
import { Editor } from 'novel-lightweight';

import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import {
    BooleanTypes,
    FormData,
    IBooleanType,
    ICreateToken,
} from '@/types/dashboard/nav';

import CreatableSelect from 'react-select/creatable';
import ImageUpload from '@/components/ui/UploadImage';

export interface ColumnOrder {
    id: string;
    name: string;
    databaseId: string;
    relationLink: {
        columnID: string;
        columnName: string;
        databaseID: string;
        databaseName: string;
        type: string;
    };
    type:
        | 'Number'
        | 'Text'
        | 'RichText'
        | 'Boolean'
        | 'Attachment'
        | 'Calendar'
        | 'Relation'
        | 'Tags';
}

const CreateTableRowModal = ({
    isOpenModel,
    onOpenChange,
    onClose,
    data,
    DBName,
}: ICreateToken) => {
    const schema = generateSchema(data.columnOrders);

    const [loading, setLoading] = useState(false);

    const queryClient = useQueryClient();

    const relationColumns = data.columnOrders.filter(
        (column: ColumnOrder) => column.type === 'Relation'
    );

    const relationData: any[] = relationColumns.map((column: ColumnOrder) => {
        const { rowDataSelect, rowRefetch } = useRelationRowData(
            column.relationLink.databaseID,
            column.relationLink.columnName
        );
        return { columnName: column.name, rowDataSelect, rowRefetch };
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            tags: [],
        },
    });

    const { setRowTableData } = useRowTableCacheUpdate(data.id, queryClient);

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

    const onSubmit = async (formData: FormData) => {
        const { id, columnOrders } = data;

        setLoading(true);

        try {
            // Create an array of promises for each key in formData
            const rowDataPromises = Object.keys(formData).map(async (key) => {
                const column = columnOrders.find(
                    (col: ColumnOrder) => col.name === key
                );
                let contentValue;

                switch (column?.type) {
                    case 'Number':
                        contentValue = Number(formData[key]);
                        break;
                    case 'Boolean':
                        contentValue = formData[key];
                        break;
                    case 'Tags':
                        contentValue = Array.isArray(formData[key])
                            ? formData[key]
                            : [formData[key]];
                        break;
                    case 'Calendar':
                        contentValue = formData[key];
                        break;
                    case 'Attachment':
                        let imageUrl = null;
                        if (formData[key]) {
                            imageUrl = await uploadImage(formData[key]);
                            imageUrl = String(imageUrl);
                        }
                        contentValue = imageUrl;
                        break;
                    default:
                        contentValue = formData[key];
                }

                return {
                    name: key,
                    type: column?.type,
                    content: contentValue,
                };
            });

            // Use Promise.all to resolve all promises
            const rowData = await Promise.all(rowDataPromises);

            const newRowOrder = await createRowOrder({
                dbname: DBName,
                databaseId: id,
                order: 1,
                rowData,
            });

            if (newRowOrder && 'error' in newRowOrder) {
                throw new Error(newRowOrder.error);
            }
            setRowTableData(newRowOrder);
            toast.success('Row Order Successfully Created');
            onClose();
            reset();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error creating RowOrder:', error);

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'An unknown error occurred';

            toast.error(
                errorMessage || 'Failed to create Row Order. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        relationData.forEach((rel) => {
            if (rel.rowRefetch) {
                rel.rowRefetch();
            }
        });
    }, [data]);

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
            largeSize
            isOpen={isOpenModel}
            title="Create Table Row"
            onOpenChange={onOpenChange}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {relationData &&
                    data.columnOrders
                        .filter((column: ColumnOrder) => column.name !== 'No')
                        .map((column: ColumnOrder) => (
                            <div
                                key={column.id}
                                className="grid  items-center space-x-3"
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
                                                                name={
                                                                    field.name
                                                                }
                                                                control={
                                                                    control
                                                                }
                                                            />
                                                        )}
                                                    />
                                                );
                                            case 'Number':
                                                return (
                                                    <div>
                                                        <Input
                                                            {...register(
                                                                column.name,
                                                                {
                                                                    setValueAs:
                                                                        (v) =>
                                                                            v ===
                                                                            ''
                                                                                ? undefined
                                                                                : Number(
                                                                                      v
                                                                                  ),
                                                                }
                                                            )}
                                                            type="number"
                                                            label={column.name}
                                                            fullWidth
                                                            color={
                                                                errors[
                                                                    column.name
                                                                ]
                                                                    ? 'danger'
                                                                    : 'default'
                                                            }
                                                        />
                                                        {errors[column.name]
                                                            ?.message && (
                                                            <p className="text-red-500 text-sm">
                                                                {String(
                                                                    errors[
                                                                        column
                                                                            .name
                                                                    ]?.message
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            case 'Text':
                                                return (
                                                    <div>
                                                        <Input
                                                            {...register(
                                                                column.name
                                                            )}
                                                            type="text"
                                                            label={column.name}
                                                            fullWidth
                                                            color={
                                                                errors[
                                                                    column.name
                                                                ]
                                                                    ? 'danger'
                                                                    : 'default'
                                                            }
                                                        />
                                                        {errors[column.name]
                                                            ?.message && (
                                                            <p className="text-red-500 text-sm">
                                                                {String(
                                                                    errors[
                                                                        column
                                                                            .name
                                                                    ]?.message
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            case 'RichText':
                                                return (
                                                    <Controller
                                                        name={column.name}
                                                        control={control}
                                                        defaultValue=""
                                                        render={({
                                                            field: {
                                                                onChange,
                                                                value,
                                                            },
                                                            fieldState: {
                                                                error,
                                                            },
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
                                                                errors[
                                                                    column.name
                                                                ]
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
                                                                        {
                                                                            item.label
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </Select>

                                                        {errors[column.name]
                                                            ?.message && (
                                                            <p className="text-red-500 text-sm">
                                                                {String(
                                                                    errors[
                                                                        column
                                                                            .name
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
                                                            color={
                                                                errors[
                                                                    column.name
                                                                ]
                                                                    ? 'danger'
                                                                    : 'default'
                                                            }
                                                        />
                                                        {errors[column.name]
                                                            ?.message && (
                                                            <p className="text-red-500 text-sm">
                                                                {String(
                                                                    errors[
                                                                        column
                                                                            .name
                                                                    ]?.message
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            case 'Relation':
                                                let one_to_one_or_many =
                                                    column.relationLink.type;

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
                                                                    //@ts-ignore
                                                                    selectedKeys={value.map(
                                                                        (
                                                                            item: any
                                                                        ) =>
                                                                            item.selectedValue
                                                                    )}
                                                                    className="w-full"
                                                                    onSelectionChange={(
                                                                        selectedKeys
                                                                    ) => {
                                                                        const selectedArray =
                                                                            Array.from(
                                                                                selectedKeys
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

                                                                                    return {
                                                                                        rowID: selectedRow.rowOrderId,
                                                                                        selectedValue:
                                                                                            selected,
                                                                                    };
                                                                                }
                                                                            );

                                                                        onChange(
                                                                            //selectedArray
                                                                            selectedValue
                                                                        ); // Update the form value
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
                                                                        column
                                                                            .name
                                                                    ]?.message
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            // if (
                                            //     one_to_one_or_many ===
                                            //     'one_to_many'
                                            // ) {
                                            //     return (
                                            //         <div>
                                            //             <Controller
                                            //                 name={
                                            //                     column.name
                                            //                 }
                                            //                 control={
                                            //                     control
                                            //                 }
                                            //                 defaultValue={[]}
                                            //                 render={({
                                            //                     field: {
                                            //                         onChange,
                                            //                         value,
                                            //                     },
                                            //                 }) => (
                                            //                     <Select
                                            //                         label={
                                            //                             column.name
                                            //                         }
                                            //                         selectionMode={
                                            //                             one_to_one_or_many ==
                                            //                             'one_to_many'
                                            //                                 ? 'multiple'
                                            //                                 : 'single'
                                            //                         }
                                            //                         //@ts-ignore
                                            //                         selectedKeys={value.map(
                                            //                             (
                                            //                                 item: any
                                            //                             ) =>
                                            //                                 item.selectedValue
                                            //                         )}
                                            //                         // selectedKeys={
                                            //                         //     new Set(
                                            //                         //         value as string
                                            //                         //     )
                                            //                         // } // Convert array to Set for Select
                                            //                         className="w-full"
                                            //                         onSelectionChange={(
                                            //                             selectedKeys
                                            //                         ) => {
                                            //                             const selectedArray =
                                            //                                 Array.from(
                                            //                                     selectedKeys
                                            //                                 );

                                            //                             // i wanna get the rowID of that select item.
                                            //                             const selectedValue =
                                            //                                 selectedArray.map(
                                            //                                     (
                                            //                                         selected
                                            //                                     ) => {
                                            //                                         const selectedRow =
                                            //                                             relatedData.rowDataSelect.find(
                                            //                                                 (
                                            //                                                     row: any
                                            //                                                 ) =>
                                            //                                                     JSON.parse(
                                            //                                                         row.content
                                            //                                                     ) ==
                                            //                                                     selected
                                            //                                             );

                                            //                                         return {
                                            //                                             rowID: selectedRow.rowOrderId,
                                            //                                             selectedValue:
                                            //                                                 selected,
                                            //                                         };
                                            //                                     }
                                            //                                 );

                                            //                             onChange(
                                            //                                 //selectedArray
                                            //                                 selectedValue
                                            //                             ); // Update the form value
                                            //                         }}
                                            //                         color={
                                            //                             errors[
                                            //                                 column
                                            //                                     .name
                                            //                             ]
                                            //                                 ? 'danger'
                                            //                                 : 'default'
                                            //                         }
                                            //                     >
                                            //                         {(
                                            //                             relatedData?.rowDataSelect ||
                                            //                             []
                                            //                         ).map(
                                            //                             (
                                            //                                 item: any
                                            //                             ) => (
                                            //                                 <SelectItem
                                            //                                     key={JSON.parse(
                                            //                                         item?.content
                                            //                                     )}
                                            //                                     value={
                                            //                                         item.content
                                            //                                     }
                                            //                                 >
                                            //                                     {typeof item.content ===
                                            //                                     'string'
                                            //                                         ? JSON.parse(
                                            //                                               item.content
                                            //                                           )
                                            //                                         : 'N/A'}
                                            //                                 </SelectItem>
                                            //                             )
                                            //                         )}
                                            //                     </Select>
                                            //                 )}
                                            //             />
                                            //             {errors[column.name]
                                            //                 ?.message && (
                                            //                 <p className="text-red-500 text-sm">
                                            //                     {String(
                                            //                         errors[
                                            //                             column
                                            //                                 .name
                                            //                         ]
                                            //                             ?.message
                                            //                     )}
                                            //                 </p>
                                            //             )}
                                            //         </div>
                                            //     );
                                            // } else {
                                            //     return (
                                            //         <div>
                                            //             <Select
                                            //                 {...register(
                                            //                     column.name
                                            //                 )}
                                            //                 label={
                                            //                     column.name
                                            //                 }
                                            //                 fullWidth
                                            //                 color={
                                            //                     errors[
                                            //                         column
                                            //                             .name
                                            //                     ]
                                            //                         ? 'danger'
                                            //                         : 'default'
                                            //                 }
                                            //             >
                                            //                 {(
                                            //                     relatedData?.rowDataSelect ||
                                            //                     []
                                            //                 ).map(
                                            //                     (
                                            //                         item: any
                                            //                     ) => (
                                            //                         <SelectItem
                                            //                             key={JSON.parse(
                                            //                                 item?.content
                                            //                             )}
                                            //                             value={
                                            //                                 item.rowOrderId
                                            //                             }
                                            //                         >
                                            //                             {typeof item.content ===
                                            //                             'string'
                                            //                                 ? JSON.parse(
                                            //                                       item.content
                                            //                                   )
                                            //                                 : 'N/A'}
                                            //                         </SelectItem>
                                            //                     )
                                            //                 )}
                                            //             </Select>
                                            //             {errors[column.name]
                                            //                 ?.message && (
                                            //                 <p className="text-red-500 text-sm">
                                            //                     {String(
                                            //                         errors[
                                            //                             column
                                            //                                 .name
                                            //                         ]
                                            //                             ?.message
                                            //                     )}
                                            //                 </p>
                                            //             )}
                                            //         </div>
                                            //     );
                                            // }
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
                                                                        column
                                                                            .name
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
                        Create
                    </Button>
                    <Button onClick={handleClose}>Cancel</Button>
                </ModalFooter>
            </form>
        </ModalComponent>
    );
};

export default CreateTableRowModal;
