import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';

interface props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    title: string;
    largeSize?: boolean;
    children: React.ReactNode;
}

export default function ModalComponent({
    isOpen,
    onOpenChange,
    children,
    title,
    largeSize,
}: props) {
    return (
        <div>
            {largeSize ? (
                <>
                    <Modal
                        placement="center"
                        size="5xl"
                        scrollBehavior="inside"
                        classNames={{
                            body: 'w-[800px] mx-auto',
                        }}
                        isOpen={isOpen}
                        onOpenChange={onOpenChange}
                    >
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">
                                        {title}
                                    </ModalHeader>
                                    <ModalBody>{children}</ModalBody>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                </>
            ) : (
                <>
                    <Modal
                        placement="center"
                        isOpen={isOpen}
                        onOpenChange={onOpenChange}
                    >
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">
                                        {title}
                                    </ModalHeader>
                                    <ModalBody>{children}</ModalBody>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                </>
            )}
        </div>
    );
}
