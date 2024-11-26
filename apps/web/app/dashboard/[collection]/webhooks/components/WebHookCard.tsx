import { Snippet } from '@nextui-org/snippet';
import React, { useCallback, useState } from 'react';
import {
    Accordion,
    AccordionItem,
    Button,
    Chip,
    Code,
    ModalFooter,
    useDisclosure,
} from '@nextui-org/react';
import useRowTableRow from '@/hooks/dataFetching/useRowTableData';
import { ColumnOrder, RowData } from '@prisma/client';
import useWebHookData from '@/hooks/dataFetching/useWebHookData';
import BodyDisplay from '../../api/components/BodyDisplay';
import ModalComponent from '@/components/ui/Model';
import { deleteWebHookAction } from '../action';
import toast from 'react-hot-toast';
import { useWebHookCatchUpdate } from '@/hooks/cacheUpdate/useWebHookCacheUpdate';
import { useQueryClient } from '@tanstack/react-query';

interface IAPICard {
    name: string;
    id: string;
    collection: string;
    columnOrders: ColumnOrder[];
}

interface APISectionProps {
    url: string;
    color: 'primary' | 'secondary' | 'success' | 'danger';
    content: ColumnOrder[];
    id: string;
    name: string;
    itemID: string;
}

// Reusable component for each API method section
const WebHookSection = ({
    url,
    color,
    content,
    id,
    name,
    itemID,
}: APISectionProps) => {
    const {
        isOpen: isOpenModel,
        onOpen,
        onClose,
        onOpenChange,
    } = useDisclosure();

    const [loading, setisLoading] = useState(false);
    const queryClient = useQueryClient();
    const { deleteWebhook } = useWebHookCatchUpdate(queryClient);

    const handleDelete = useCallback(
        async (token: string) => {
            setisLoading(true);
            try {
                const apiToken = await deleteWebHookAction(token);
                if (apiToken.id) {
                    toast.success(
                        `Successfully deleted ${apiToken.name} webhook`
                    );
                    deleteWebhook(apiToken);
                    onClose();
                }
            } catch (error) {
            } finally {
                setisLoading(false);
            }
        },
        [deleteWebhook]
    );

    return (
        <div>
            <div className="flex justify-between items-center">
                <div className="w-[500px]">
                    <Chip color={color} variant="dot">
                        {name}
                    </Chip>
                    <Accordion className="w-full">
                        <AccordionItem
                            key={url}
                            title={
                                <div className="flex flex-col w-full space-y-2">
                                    <Snippet
                                        variant="flat"
                                        className="w-full"
                                        color={color}
                                    >
                                        {url}
                                    </Snippet>
                                </div>
                            }
                        >
                            <Code className="w-full p-4 bg-gray-100 rounded-md">
                                <BodyDisplay
                                    method={'CREATE'}
                                    id={id}
                                    data={content}
                                />
                            </Code>
                        </AccordionItem>
                    </Accordion>
                </div>
                <Button
                    className="!bg-[#EB0E5C]"
                    variant="flat"
                    color="danger"
                    onPress={onOpen}
                    disabled={loading}
                    isLoading={loading}
                >
                    Delete
                </Button>
            </div>
            <ModalComponent
                isOpen={isOpenModel}
                onOpenChange={onOpenChange}
                title="Comfirm Delection"
            >
                <p>Are you sure you want to delete?</p>
                <ModalFooter>
                    <Button
                        className="!bg-[#EB0E5C]"
                        color="danger"
                        type="submit"
                        onClick={() => handleDelete(itemID)}
                    >
                        Delete
                    </Button>
                </ModalFooter>
            </ModalComponent>
        </div>
    );
};

const WebHookCard = ({ name, collection, columnOrders, id }: IAPICard) => {
    const { WebHookData } = useWebHookData();

    return (
        <div className="flex flex-col space-y-4">
            {WebHookData?.map((item) => {
                if (item.tableAccess === name) {
                    return (
                        <WebHookSection
                            url={item.webUrl}
                            color="primary"
                            itemID={item.id}
                            name={item.name}
                            id={id}
                            content={columnOrders}
                        />
                    );
                }
            })}
        </div>
    );
};

export default WebHookCard;
