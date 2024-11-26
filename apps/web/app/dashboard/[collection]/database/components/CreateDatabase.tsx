import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '@nextui-org/modal';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import {
    createDatabase,
    TypeDatabaseCreateSchema,
} from '@/validation/database';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { createDatabaseAction } from '../actions/databaseActions';
import { Spinner } from '@nextui-org/spinner';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useDatabaseCacheUpdate } from '@/hooks/cacheUpdate/useDatabaseCacheUpdate';

export interface ModalProp {
    closeIt?: any;
    isOpen: any;
    onOpenChange: any;
    collectionName: string;
}

export const CreateDatabaseModal = (prop: ModalProp) => {
    const queryClient = useQueryClient();
    const { addDatabase } = useDatabaseCacheUpdate(queryClient);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<TypeDatabaseCreateSchema>({
        resolver: zodResolver(createDatabase),
    });

    const { execute, result, status } = useAction(createDatabaseAction);

    const onSubmit = async (values: TypeDatabaseCreateSchema) => {
        execute({
            name: values.name,
            collectionName: prop.collectionName,
        });
        reset();
    };

    useEffect(() => {
        if (result.data?.status === 'success' && result.data.data) {
            addDatabase(result.data.data);
            toast.success(`${result.data.data.name} created successfully`);
            prop.closeIt();
            reset();
        }
    }, [result]);

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
                            Create New Database
                        </ModalHeader>
                        <ModalBody className="space-y-3">
                            <Input
                                {...register('name')}
                                type="text"
                                label="Database Name"
                                placeholder="Name Your Database"
                            />
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
                                    'Create Database'
                                )}
                            </Button>
                        </ModalFooter>
                    </form>
                )}
            </ModalContent>
        </Modal>
    );
};
