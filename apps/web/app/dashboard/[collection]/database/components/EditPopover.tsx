'use client';

import { Popover, PopoverTrigger, PopoverContent } from '@nextui-org/popover';
import { useEffect, useRef } from 'react';
import { Input } from '@nextui-org/input';
import { ImBin } from 'react-icons/im';

interface props {
    children: React.ReactNode;
    inputValue: string;
    deleteButton: string;
    shownDeleteButton: boolean;
    updateAction: (updateName: string) => void;
    deleteAction: () => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function EditPopover({
    children,
    inputValue,
    deleteButton,
    shownDeleteButton,
    updateAction,
    deleteAction,
    isOpen,
    setIsOpen,
}: props) {
    const renameRef = useRef<HTMLInputElement>(null);

    // for input focusing after the popover was opened.
    useEffect(() => {
        if (isOpen && renameRef.current) {
            renameRef.current.focus();
        }
    }, [isOpen]);

    return (
        <Popover
            isOpen={isOpen}
            onOpenChange={(open) => setIsOpen(open)}
            placement="bottom"
            showArrow={true}
        >
            <PopoverTrigger>{children}</PopoverTrigger>
            <PopoverContent>
                <div className="px-1 py-2 space-y-2">
                    <Input
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && renameRef.current) {
                                updateAction(renameRef.current?.value.trim());
                            }
                        }}
                        ref={renameRef}
                        type="text"
                        label=""
                        size="sm"
                        defaultValue={inputValue}
                    />

                    {shownDeleteButton && (
                        <div className="flex flex-row items-center space-x-2 h-full py-[6px] px-2 rounded-lg hover:cursor-pointer hover:bg-[#F3F3F3]">
                            <ImBin
                                size={15}
                                className="flex-shrink-0 text-[#37352F]"
                            />

                            <button
                                onClick={() => {
                                    deleteAction();
                                }}
                                className="text-sm text-[#37352F]"
                            >
                                {deleteButton}
                            </button>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
