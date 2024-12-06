'use client';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IoMdSettings } from 'react-icons/io';
import { Popover, PopoverTrigger, PopoverContent } from '@nextui-org/popover';
import { Inav } from '@/types/dashboard/nav';
import { QueryClient } from '@tanstack/react-query';
import { ImBin } from 'react-icons/im';
import { Input } from '@nextui-org/input';
import ModalComponent from '@/components/ui/Model';
import { ModalFooter, useDisclosure } from '@nextui-org/modal';
import { useCollectionCatheUpdate } from '@/hooks/cacheUpdate/useCollectionCacheUpdate';
import {
    deleteCollectionAction,
    updateCollectionAction,
} from './collectionActions';
import toast from 'react-hot-toast';
import { $Enums } from '@prisma/client';
import { Button } from '@nextui-org/button';

const NavItem = ({
    item,
    isActive,
    queryClient,
    role,
}: {
    item: Inav;
    isActive: boolean;
    queryClient: QueryClient;
    role: $Enums.Role | undefined;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setisLoading] = useState(false);
    const {
        isOpen: isOpenModel,
        onOpen,
        onClose,
        onOpenChange,
    } = useDisclosure();
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
    const renameRef = useRef<HTMLInputElement>(null);

    const { deleteCollection, updateCollection } =
        useCollectionCatheUpdate(queryClient);

    const handleDeleteModal = useCallback(() => {
        setIsOpen(false);
        onOpen();
    }, [onOpen]);

    // Debounced hover handlers
    const handleMouseEnter = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current); // Clear previous timeout
        hoverTimeout.current = setTimeout(() => {
            setIsHovered(true); // Set hover state after debounce delay
        }, 150); // Delay in milliseconds
    };

    const handleMouseLeave = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current); // Clear previous timeout
        hoverTimeout.current = setTimeout(() => {
            setIsHovered(false); // Remove hover state after debounce delay
        }, 150); // Delay in milliseconds
    };

    useEffect(() => {
        if (isOpen && renameRef.current) {
            renameRef.current.focus();
        }
    }, [isOpen]);

    const handleDelete = useCallback(
        async (collectionId: string) => {
            setisLoading(true);
            try {
                const collection = await deleteCollectionAction(collectionId);
                if (collection.id) {
                    toast.success(
                        `Successfully deleted ${collection.name} collection`
                    );
                    deleteCollection(collection);
                }
            } catch (error) {
                toast.error(
                    'Failed to delete the collection. Please try again.'
                );
            } finally {
                setisLoading(false);
                setIsHovered(false);
            }
        },
        [deleteCollection, onClose]
    );

    const handleRename = async (id: string, name: string) => {
        try {
            const input = { id: id, name: name };
            const collection = await updateCollectionAction(input);
            if (collection.data && collection.status == 'success') {
                toast.success(
                    `Successfully updated ${collection.data.name} collection`
                );
                updateCollection(collection.data);
            }
            if (collection.error) {
                toast.error(collection.error);
            }
        } catch (error: any) {
            toast.error(error);
        } finally {
            onClose();
        }
    };

    return (
        <div
            className={`flex flex-row justify-between items-center px-3 py-2 rounded-lg cursor-pointer ${
                isActive || isHovered ? 'bg-[#EFEFED]' : ''
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Link href={`/dashboard/${item.name}`} className="flex-1">
                <p
                    className={`text-lg font-semibold ${isActive ? ' text-[#282621]' : ' text-[#5F5E5A]'} `}
                >
                    {item.name}
                </p>
            </Link>

            {role === 'God' && (
                <>
                    {isHovered && (
                        <Popover
                            isOpen={isOpen}
                            onOpenChange={(open) => setIsOpen(open)}
                            placement="bottom"
                            showArrow={true}
                        >
                            <PopoverTrigger>
                                <button>
                                    <IoMdSettings size={20} />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <div>
                                    <div className="px-1 py-2 space-y-2">
                                        <Input
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === 'Enter' &&
                                                    renameRef.current
                                                ) {
                                                    const newName =
                                                        renameRef.current.value.trim();
                                                    if (
                                                        newName &&
                                                        newName !== item.name
                                                    ) {
                                                        handleRename(
                                                            item.id,
                                                            newName
                                                        );
                                                    }
                                                }
                                            }}
                                            type="text"
                                            size="sm"
                                            defaultValue={item.name}
                                            ref={renameRef}
                                        />
                                    </div>

                                    <div className="flex flex-row items-center space-x-2 h-full py-[6px]   px-2 rounded-lg hover:cursor-pointer hover:bg-[#F3F3F3]">
                                        <ImBin
                                            size={15}
                                            className="flex-shrink-0 text-[#37352F]"
                                        />
                                        <button
                                            onClick={handleDeleteModal}
                                            className="text-sm text-[#37352F]"
                                        >
                                            Delete Property
                                        </button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </>
            )}

            <ModalComponent
                isOpen={isOpenModel}
                title="Are you sure you want to delete?"
                onOpenChange={onOpenChange}
            >
                <div className="px-1 py-2 space-y-2">
                    <Input
                        disabled
                        type="text"
                        size="sm"
                        defaultValue={item.name}
                    />
                    <p className="text-sm">
                        This action cannot be undone. Do you still want to
                        delete the collection "{item.name}"?
                    </p>

                    <ModalFooter>
                        <Button
                            className="!bg-[#EB115D]"
                            color="danger"
                            type="submit"
                            onClick={() => handleDelete(item.id)}
                            isDisabled={loading}
                            isLoading={loading}
                        >
                            Delete
                        </Button>
                    </ModalFooter>
                </div>
            </ModalComponent>
        </div>
    );
};

export default NavItem;
