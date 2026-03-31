"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    CldUploadWidget,
    type CloudinaryUploadWidgetResults,
} from "next-cloudinary";

interface ImageUploadProps {
    disabled?: boolean;
    value?: string;
    onChange: (value: string) => void;
    onRemove: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    disabled,
    value,
    onChange,
    onRemove,
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const handleUpload = (result: CloudinaryUploadWidgetResults) => {
        const info = result?.info;

        if (typeof info === "object" && info && "secure_url" in info) {
            onChange(info.secure_url as string);
        }
    };

    return (
        <div className="space-y-4">
            {value && (
                <div className="relative w-40 h-40 rounded-md overflow-hidden border">
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 z-10"
                        onClick={onRemove}
                        disabled={disabled}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>

                    <Image src={value} alt="image" fill className="object-cover" />
                </div>
            )}

            <CldUploadWidget uploadPreset="tudfiosw" onSuccess={handleUpload}>
                {({ open }) => (
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={disabled}
                        onClick={() => open()}
                    >
                        <ImagePlus className="h-4 w-4 mr-2" />
                        Upload Image
                    </Button>
                )}
            </CldUploadWidget>
        </div>
    );
};

export default ImageUpload;