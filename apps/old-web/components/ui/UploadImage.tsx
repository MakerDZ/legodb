'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, CardBody, Image } from '@nextui-org/react';
import { Upload, X } from 'lucide-react';
import { Controller, Control } from 'react-hook-form';
import { deleteImageByUrl } from '@/data-access/rowOrder';

interface ImageUploadProps {
    name: string;
    control: Control<any>;
    image?: any;
}

export default function ImageUpload({ name, control, image = null }: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageToShow, setImageToShow] = useState<string | null>(null);

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        onChange: (file: File | null) => void
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageToShow(reader.result as string);
            };
            reader.readAsDataURL(file);
            onChange(file);
        } else {
            onChange(null);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleDelete = async (onChange: (file: File | null) => void) => {
        if (imageToShow) {
            await deleteImageByUrl(imageToShow);
        }

        onChange(null);
        setImageToShow(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        if (imageToShow) {
            setImageToShow(null);
        }
        if (image) {
            setImageToShow(image);
        }
    }, [image, name, control]);

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <Card className="w-full relative shadow-none border mx-auto p-2 mt-4">
                    <CardBody className="flex flex-col items-center space-y-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                handleFileChange(e, field.onChange)
                            }
                            className="hidden"
                            ref={fileInputRef}
                            aria-label="Upload image"
                        />
                        {!imageToShow ? (
                            <div className="text-center">
                                <Upload className="mx-auto h-12 w-full text-default-400" />
                                <h3 className="mt-2 text-sm font-semibold text-foreground">
                                    No image uploaded
                                </h3>
                                <p className="mt-1 text-xs text-default-400">
                                    SVG, PNG, JPG, or GIF (MAX. 800KB)
                                </p>
                                <Button
                                    onClick={handleButtonClick}
                                    color="primary"
                                    variant="flat"
                                    className="mt-4"
                                >
                                    Select Image
                                </Button>
                            </div>
                        ) : (
                            <div className=" h-full ">
                                <div className=" mx-auto overflow-hidden">
                                    {imageToShow && (
                                        <Image
                                            src={imageToShow}
                                            width={300}
                                            height={250}
                                            alt="Uploaded preview"
                                            className=" mx-auto text-center  rounded-lg"
                                        />
                                    )}
                                </div>
                                <div className="">
                                    <Button
                                        isIconOnly
                                        color="danger"
                                        variant="flat"
                                        size="sm"
                                        className="-top-[0.1rem] z-30 left-[10] absolute bottom-0 rounded-full cursor-pointer"
                                        onClick={() =>
                                            handleDelete(field.onChange)
                                        }
                                        aria-label="Delete image"
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}
        />
    );
}
