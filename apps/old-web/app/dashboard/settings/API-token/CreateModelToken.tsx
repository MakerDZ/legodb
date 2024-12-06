import ModalComponent from '@/components/ui/Model';
import { APITokenSchema, TypeAPiTokenSchema } from '@/validation/API-Token';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@nextui-org/button';
import { Input } from '@nextui-org/input';
import { ModalFooter } from '@nextui-org/modal';
import { Select, SelectItem } from '@nextui-org/select';
import { Spinner } from '@nextui-org/spinner';
import { useAction } from 'next-safe-action/hooks';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { createApiTokenAction } from './action';
import toast from 'react-hot-toast';
import { useApiTokenCatchUpdate } from '@/hooks/cacheUpdate/useApiTokenCacheUpdate';
import { useQueryClient } from '@tanstack/react-query';

const collection = [
    {
        key: 'collection',
        label: 'Collection',
    },
    {
        key: 'database',
        label: 'Database',
    },
];

export const accessLevel = ['GET', 'POST', 'PUT', 'DELETE'];

export interface ICreateToken {
    isOpenModel: boolean;
    onOpenChange: any;
    onClose: () => void;
}

const CreateModelToken = ({
    isOpenModel,
    onOpenChange,
    onClose,
}: ICreateToken) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        control,
        reset,
    } = useForm<TypeAPiTokenSchema>({
        resolver: zodResolver(APITokenSchema),
    });
    const queryClient = useQueryClient();

    const { result, execute, status } = useAction(createApiTokenAction);
    const { setApiToken } = useApiTokenCatchUpdate(queryClient);

    const onSubmit = async (data: TypeAPiTokenSchema) => {
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
            setApiToken(result.data.data);
        } else if (result.data?.error) {
            toast.error(result.data.error);
        }
    }, [result, status]);

    return (
        <div>
            <ModalComponent
                isOpen={isOpenModel}
                title="Create API Token"
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
                            <Controller
                                name="dataAccessLevel"
                                control={control}
                                defaultValue={[]}
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        label="Allowed Data Level"
                                        selectionMode="multiple"
                                        placeholder="Data Level"
                                        selectedKeys={new Set(value)} // Convert array to Set for Select
                                        className="w-full"
                                        onSelectionChange={(selectedKeys) => {
                                            const selectedArray =
                                                Array.from(selectedKeys);
                                            onChange(selectedArray); // Update the form value
                                        }}
                                    >
                                        {collection.map((coll) => (
                                            <SelectItem
                                                key={coll.key}
                                                value={coll.key}
                                            >
                                                {coll.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            {errors.dataAccessLevel && (
                                <p className="text-red-500 text-xs mt-2 ml-2 ">
                                    {errors.dataAccessLevel.message}
                                </p>
                            )}
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

export default CreateModelToken;
