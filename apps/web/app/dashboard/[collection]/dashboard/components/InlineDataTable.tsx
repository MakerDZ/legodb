'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Image, ModalContent, Tooltip, useDisclosure } from '@nextui-org/react';
import { RowData } from '@prisma/client';
import { Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/MarkDownModal';
import MarkdownPreview from '@uiw/react-markdown-preview';
import ModalComponent from '@/components/ui/Model';
import MarkDownModal from '@/components/ui/MarkDownModal';

interface InlineDBProp {
    data: {
        databaseId: string;
        id: string;
        order: number;
        rowData: RowData[];
    };
}

const formatContent = (item: { type: string; content: any }) => {
    if (typeof item.content === 'string') {
        try {
            const parsedContent = JSON.parse(item.content);

            if (item.type === 'Relation') {
                console.log(parsedContent);
                if (Array.isArray(parsedContent)) {
                    return parsedContent
                        .map((relation) => {
                            return relation.selectedValue;
                        })
                        .join(', ');
                  
                }
                return parsedContent;
            }

            if (Array.isArray(parsedContent)) {
                return parsedContent.join(', ');
            } else if (typeof parsedContent === 'object') {
                return Object.entries(parsedContent)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
            }

            return parsedContent.join('');
        } catch (error) {
            return item.content;
        }
    }

    return item.content ?? 'N/A';
};

const InlineDataTable = ({ data }: InlineDBProp) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useSortable({ id: data.id });

    const rowStyle = {
        transform: CSS.Translate.toString(transform),
        transition: 'transform 0.2s ease-in-out',
        opacity: isDragging ? 0.7 : 1,
    };

    const { isOpen, onOpen, onClose } = useDisclosure();

    const renderRowData = (item: RowData) => {
        const formattedContent = formatContent(item);
        const content =
            typeof item.content === 'string' ? JSON.parse(item.content) : '';

        return (
            <th
                key={item.id}
                className="border-b border-r border-[#E9E9E7] p-2"
            >
                <div
                    {...attributes}
                    {...listeners}
                    className="w-[150px] flex items-center text-[#7D7C77] font-semibold space-x-1"
                >
                    {item.type === 'Attachment' ? (
                        <>
                            {content && (
                                <Image
                                    src={content}
                                    width={40}
                                    height={40}
                                    alt="Uploaded preview"
                                    className=" mx-auto text-center  rounded-lg"
                                />
                            )}
                        </>
                    ) : (
                        <>
                            {item.type === 'RichText' ? (
                                <>
                                    <div className="">
                                        <Button onPress={onOpen} size="sm">
                                            Preview
                                        </Button>

                                        <MarkDownModal
                                            onOpenChange={onClose}
                                            isOpen={isOpen}
                                            onClose={onClose}
                                        >
                                            <div data-color-mode="light">
                                                <MarkdownPreview
                                                    source={content}
                                                />
                                            </div>
                                        </MarkDownModal>
                                    </div>
                                </>
                            ) : (
                                <Tooltip
                                    content={
                                        item.type === 'Relation'
                                            ? formattedContent
                                            : content
                                    }
                                >
                                    <p className="truncate">
                                        {item.type === 'Relation'
                                            ? formattedContent
                                            : Array.isArray(content)
                                              ? content.join(' , ')
                                              : content}
                                    </p>
                                </Tooltip>
                            )}
                        </>
                    )}
                </div>
            </th>
        );
    };

    return (
        <div className="flex flex-row">
            <div className="overflow-x-auto rounded-lg flex flex-row w-full justify-between">
                <table className="table-auto border-collapse border-l border-[#E9E9E7]">
                    <thead>
                        <tr
                            ref={setNodeRef}
                            {...attributes}
                            {...listeners}
                            style={rowStyle}
                            className="border-t flex flex-row"
                        >
                            <th className="border-b border-r border-[#E9E9E7] p-2">
                                <div className="w-[150px] flex items-center text-[#7D7C77] font-semibold space-x-1">
                                    <p>{data.order}</p>
                                </div>
                            </th>

                            {data.rowData?.map(renderRowData)}
                        </tr>
                    </thead>
                </table>
            </div>
        </div>
    );
};

export default InlineDataTable;
