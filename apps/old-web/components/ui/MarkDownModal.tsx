import { Button } from '@nextui-org/button';
import {
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Modal,
} from '@nextui-org/modal';
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    children: React.ReactNode;
    onClose: any;
}

const MarkDownModal: React.FC<ModalProps> = ({
    isOpen,
    onOpenChange,
    children,
    onClose,
}) => {
    ``;
    if (!isOpen) return null;

    return (
        <Modal
            placement="center"
            size="4xl"
            scrollBehavior="inside"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>MarkDown Preview</ModalHeader>

                        <ModalBody>{children}</ModalBody>
                        <ModalFooter>
                            <Button color="danger" onPress={onClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default MarkDownModal;
