import { ModalProp } from '@/app/dashboard/[collection]/database/components/CreateProperty';
import React, { useEffect } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '@nextui-org/modal';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { useForm } from 'react-hook-form';
import {
    createCollection,
    TypeCollectionSchema,
} from '@/validation/collection';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner } from '@nextui-org/spinner';
import { useAction } from 'next-safe-action/hooks';
import { createCollectionaction } from './collectionActions';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useCollectionCatheUpdate } from '@/hooks/cacheUpdate/useCollectionCacheUpdate';


interface IProps {
    closeIt?: any;
    isOpen: any;
    onOpenChange: any;
}

const CreateCollectionModel = (prop: IProps) => {
    const queryClient = useQueryClient();

    const { setCollection } = useCollectionCatheUpdate(queryClient);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setFocus,
    } = useForm<TypeCollectionSchema>({
        resolver: zodResolver(createCollection),
    });

    const { result, execute, status } = useAction(createCollectionaction);

    const onSubmit = async (values: TypeCollectionSchema) => {
        execute(values);
        reset();
        prop.closeIt();
    };

    useEffect(() => {
        if (result.data?.data && status === 'hasSucceeded') {
            toast.success(`Success  ${result.data.data?.name} Collection`);
            setCollection(result.data.data);
        } else if (result.data?.error) {
            toast.error(result.data.error);
        }
    }, [result]);

    useEffect(() => {
        if (prop.isOpen) {
            setFocus('name');
        }
    }, [prop.isOpen, setFocus]);

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
                            Create New Collection
                        </ModalHeader>
                        <ModalBody className="space-y-3">
                            <Input
                                {...register('name')}
                                type="text"
                                aria-invalid={!!errors.name}
                                label="Collection Name"
                                placeholder="Name Your Collection"
                            />
                            {errors.name && (
                                <p className="text-red-600 text-sm">
                                    {errors.name.message}
                                </p>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color="primary"
                                type="submit"
                                disabled={
                                    isSubmitting || status === 'executing'
                                }
                                className="cursor-pointer !bg-[#0D98FE]"
                            >
                                {status === 'executing' ? (
                                    <Spinner color="warning" size="sm" />
                                ) : (
                                    'Create Collection'
                                )}
                            </Button>
                        </ModalFooter>
                    </form>
                )}
            </ModalContent>
        </Modal>
    );
};

export default CreateCollectionModel;
