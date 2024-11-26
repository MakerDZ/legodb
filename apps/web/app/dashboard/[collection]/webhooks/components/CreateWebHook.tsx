import { accessLevel } from '@/app/dashboard/settings/API-token/CreateModelToken';
import ModalComponent from '@/components/ui/Model';
import { ICreateToken } from '@/types/dashboard/nav';
import { APIToken, TypeAPiToken } from '@/validation/API-Token';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { ModalFooter } from '@nextui-org/modal';
import { Select, SelectItem } from '@nextui-org/select';
import { Spinner } from '@nextui-org/spinner';
import { ColumnOrder, Database } from '@prisma/client';
import { useAction } from 'next-safe-action/hooks';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useQueryClient } from '@tanstack/react-query';
import { TypeWebHook, WebHook } from '@/validation/WebHook';
import { useWebHookCatchUpdate } from '@/hooks/cacheUpdate/useWebHookCacheUpdate';
import { createWebHookAction } from '../action';
import toast from 'react-hot-toast';

interface IAPIToken extends ICreateToken {
    data: (Database & {
        columnOrders: ColumnOrder[];
    })[];
}

const CreateWebHook = ({
    isOpenModel,
    onOpenChange,
    onClose,
    data,
}: IAPIToken) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<TypeWebHook>({
        resolver: zodResolver(WebHook),
    });

    const queryClient = useQueryClient();

    const { setWebHook } = useWebHookCatchUpdate(queryClient);

    const { result, execute, status } = useAction(createWebHookAction);

    const onSubmit = (data: TypeWebHook) => {
        execute(data);
        reset();
    };

    useEffect(() => {
        if (status === 'hasErrored' || status === 'hasSucceeded') {
            reset();
            onClose();
        }
    }, [status]);

    useEffect(() => {
        if (result.data?.data && status === 'hasSucceeded') {
            toast.success(`Success  ${result.data.data.name} Created Token`);
            setWebHook(result.data.data);
        } else if (result.data?.error) {
            toast.error(result.data.error);
        }
    }, [result, status]);

    return (
        <div>
            <ModalComponent
                isOpen={isOpenModel}
                title="Create WebHook"
                onOpenChange={onOpenChange}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col space-y-4">
                        <div>
                            <Input
                                {...register('name')}
                                type="text"
                                label="Create WebHook Name"
                                placeholder="Name your WebHook"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-2 ml-2 ">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Input
                                {...register('webUrl')}
                                type="text"
                                label="Ener Url"
                                placeholder="Enter URL"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-2 ml-2 ">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Select {...register('tableAccess')} label="Table ">
                                {data.map((item) => (
                                    <SelectItem
                                        key={item.name}
                                        value={item.name}
                                    >
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <ModalFooter>
                            <Button
                                disabled={
                                    isSubmitting || status === 'executing'
                                }
                                className="cursor-pointer !bg-[#0D98FE]"
                                color="success"
                                type="submit"
                            >
                                {status === 'executing' ? (
                                    <Spinner color="warning" size="sm" />
                                ) : (
                                    'Create WebHook'
                                )}
                            </Button>
                        </ModalFooter>
                    </div>
                </form>
            </ModalComponent>
        </div>
    );
};

export default CreateWebHook;
