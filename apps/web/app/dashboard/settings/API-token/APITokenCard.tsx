import ModalComponent from '@/components/ui/Model';
import { TypeAPiTokenSchema } from '@/validation/API-Token';
import {
    Button,
    Chip,
    ModalFooter,
    Snippet,
    useDisclosure,
} from '@nextui-org/react';
import React, { useCallback, useState } from 'react';
import { deleteApiKeyAction } from './action';
import toast from 'react-hot-toast';
import { useApiTokenCatchUpdate } from '@/hooks/cacheUpdate/useApiTokenCacheUpdate';
import { useQueryClient } from '@tanstack/react-query';

interface TypeAPiToken extends TypeAPiTokenSchema {
    token: string;
}

interface IAPICard {
    item: TypeAPiToken;
}

const APITokenCard = ({ item }: IAPICard) => {
    const [isloading, setisLoading] = useState(false);
    const queryClient = useQueryClient();

    const { deleteApiToken } = useApiTokenCatchUpdate(queryClient);

    const {
        isOpen: isOpenModel,
        onOpen,
        onClose,
        onOpenChange,
    } = useDisclosure();

    const handleDelete = useCallback(
        async (token: string) => {
            setisLoading(true);
            try {
                const apiToken = await deleteApiKeyAction(token);
                if (apiToken.id) {
                    toast.success(
                        `Successfully deleted ${apiToken.name} collection`
                    );
                    deleteApiToken(apiToken);
                    onClose();
                }
            } catch (error) {
            } finally {
                setisLoading(false);
            }
        },
        [deleteApiToken]
    );

    return (
        <div>
            <p className="text-lg mb-2 font-bold">{item.name}</p>
            <div className="flex flex-col space-y-3 w-[800px]">
                <div className="flex flex-row justify-between space-x-2 w-[900px]">
                    <Snippet
                        variant="flat"
                        className="w-full"
                        symbol={item.name}
                        color="default"
                    >
                        {item.token}
                    </Snippet>
                    <Button
                        className="!bg-[#EB0E5C]"
                        variant="flat"
                        onPress={onOpen}
                        color="danger"
                    >
                        Delete
                    </Button>
                </div>
                <div
                    className="flex flex-row justify-between items-center"
                    style={{
                        overflowY: 'auto',
                    }}
                >
                    <div className="flex flex-row space-x-2">
                        {item.dataAccessLevel.map((data) => (
                            <Chip color="success" variant="flat">
                                {data}
                            </Chip>
                        ))}
                    </div>

                    <div className="flex flex-row space-x-2">
                        {item.actionAccessLevel.map((access) => (
                            <Chip color="secondary" variant="flat">
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
                        className="!bg-[#EB0E5C]"
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

export default APITokenCard;
