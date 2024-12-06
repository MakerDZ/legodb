import ModalComponent from '@/components/ui/Model';
import { useAPICatchUpdate } from '@/hooks/cacheUpdate/useAPICacheUpdate';
import { TypeAPiToken } from '@/validation/API-Token';
import { Button } from '@nextui-org/button';
import { Chip, ModalFooter, Tooltip, useDisclosure } from '@nextui-org/react';
import { Snippet } from '@nextui-org/snippet';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { deleteAPIAction } from '../action';

interface TypeAPI extends TypeAPiToken {
    token: string;
}

interface IAPI {
    item: TypeAPI;
}

const APIData = ({ item }: IAPI) => {
    const [isloading, setisLoading] = useState(false);
    const {
        isOpen: isOpenModel,
        onOpen,
        onClose,
        onOpenChange,
    } = useDisclosure();

    const queryClient = useQueryClient();
    const { deleteAPI } = useAPICatchUpdate(queryClient);

    const handleDelete = useCallback(
        async (token: string) => {
            setisLoading(true);
            try {
                const apiToken = await deleteAPIAction(token);
                if (apiToken.id) {
                    toast.success(
                        `Successfully deleted ${apiToken.name} collection`
                    );
                    deleteAPI(apiToken);
                    onClose();
                }
            } catch (error) {
            } finally {
                setisLoading(false);
            }
        },
        [deleteAPI]
    );

    const displayToken =
        item.token.length > 20
            ? `${item.token.substring(0, 35)} ...`
            : item.token;

    const handleCopy = () => {
        navigator.clipboard.writeText(item.token);
    };
    return (
        <div>
            <p className="text-lg mb-2 font-bold">{item.name}</p>
            <div className="flex flex-col space-y-3 w-[600px]">
                <div className="flex flex-row justify-between space-x-2 w-[600px]">
                    <Snippet
                        hideCopyButton
                        variant="flat"
                        className="w-full truncate text-12 py-3"
                        size="md"
                        color="default"
                    >
                        {displayToken}
                    </Snippet>

                    <Button
                        className=" !bg-[#0D98FE]"
                        variant="flat"
                        color="primary"
                        onClick={handleCopy}
                    >
                        Copy
                    </Button>

                    <Button
                        className="!bg-[#EB065A]"
                        variant="flat"
                        color="danger"
                        onPress={onOpen}
                    >
                        Delete
                    </Button>
                </div>
                <div
                    className="flex flex-row justify-start items-center"
                    style={{
                        overflowY: 'auto',
                    }}
                >
                    <div className="flex flex-row space-x-2">
                        {item.actionAccessLevel.map((access) => (
                            <Chip size="sm" color="secondary" variant="flat">
                                {access}
                            </Chip>
                        ))}
                    </div>
                </div>
            </div>

            <ModalComponent
                isOpen={isOpenModel}
                onOpenChange={onOpenChange}
                title="Comfirm Delection"
            >
                <p>Are you sure you want to delete?</p>
                <ModalFooter>
                    <Button
                        className="!bg-[#EB065A]"
                        color="danger"
                        type="submit"
                        onClick={() => handleDelete(item.token)}
                        isDisabled={isloading}
                        isLoading={isloading}
                    >
                        Delete
                    </Button>
                </ModalFooter>
            </ModalComponent>
        </div>
    );
};

export default APIData;
