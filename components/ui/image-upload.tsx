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
    folder?: string; // ✅ NEW
    previewClassName?: string;
    imageClassName?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    disabled,
    value,
    onChange,
    onRemove,
    folder,
    previewClassName,
    imageClassName,
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const handleUpload = (result: CloudinaryUploadWidgetResults) => {
        const info = result?.info;
        if (!info) return;

        if (typeof info === "string") {
            if (info.startsWith("http")) onChange(info);
            return;
        }

        const url =
            "secure_url" in info && info.secure_url
                ? info.secure_url
                : "url" in info && info.url
                    ? info.url
                    : undefined;
        if (url) onChange(url);
    };

    return (
        <div className="space-y-4">
            {value && (
                <div className={`relative w-40 h-40 rounded-md overflow-hidden border ${previewClassName || ""}`}>
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

                    <Image
                        src={value}
                        alt="Upload preview"
                        fill
                        className={imageClassName || "object-cover"}
                        sizes="160px"
                    />
                </div>
            )}

                <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "tudfiosw"}
                onSuccess={handleUpload}
                options={{
                    maxFiles: 1,
                    resourceType: "image",
                    folder: folder || "default", // ✅ dynamic
                }}
                >
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
