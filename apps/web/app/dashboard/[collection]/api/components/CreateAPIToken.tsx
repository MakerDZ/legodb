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
import { Controller, useForm } from 'react-hook-form';
import { createAPIAction } from '../action';
import toast from 'react-hot-toast';
import { useAPICatchUpdate } from '@/hooks/cacheUpdate/useAPICacheUpdate';
import { useQueryClient } from '@tanstack/react-query';

interface IAPIToken extends ICreateToken {
    data: (Database & {
        columnOrders: ColumnOrder[];
    })[];
}

const CreateAPIToken = ({
    isOpenModel,
    onOpenChange,
    onClose,
    data,
}: IAPIToken) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        control,
        reset,
    } = useForm<TypeAPiToken>({
        resolver: zodResolver(APIToken),
    });

    const queryClient = useQueryClient();

    const { setAPI } = useAPICatchUpdate(queryClient);

    const { result, execute, status } = useAction(createAPIAction);

    const onSubmit = (data: TypeAPiToken) => {
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
            setAPI(result.data.data);
        } else if (result.data?.error) {
            toast.error(result.data.error);
        }
    }, [result, status]);

    return (
        <div>
            <ModalComponent
                isOpen={isOpenModel}
                title="Create API Token for table"
                onOpenChange={onOpenChange}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col space-y-4">
                        <div>
                            <Input
                                {...register('name')}
                                type="text"
                                label="Create Token Name"
                                placeholder="Name your token"
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

                        <div>
                            <Controller
                                name="actionAccessLevel"
                                control={control}
                                defaultValue={[]}
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        label="Allowed Access Level"
                                        selectionMode="multiple"
                                        placeholder="Access Level"
                                        selectedKeys={new Set(value)} // Convert array to Set for Select
                                        className="w-full"
                                        onSelectionChange={(selectedKeys) => {
                                            const selectedArray =
                                                Array.from(selectedKeys);
                                            onChange(selectedArray); // Update the form value
                                        }}
                                    >
                                        {accessLevel.map((access) => (
                                            <SelectItem
                                                key={access}
                                                value={access}
                                            >
                                                {access}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            {errors.actionAccessLevel && (
                                <p className="text-red-500 text-xs mt-2 ml-2">
                                    {errors.actionAccessLevel.message}
                                </p>
                            )}
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
                                    'Create API Token'
                                )}
                            </Button>
                        </ModalFooter>
                    </div>
                </form>
            </ModalComponent>
        </div>
    );
};

export default CreateAPIToken;
