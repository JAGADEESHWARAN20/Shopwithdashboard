"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ImagePlus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CldUploadWidget } from 'next-cloudinary'

interface imageuploadProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    value: string[];

}


const imageupload: React.FC<imageuploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value,

}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onUpload = (result: any) => {
        onChange(result.info.secure_url);
    }

    if (!isMounted) {
        return null;
    }
    return (
        <div className="flex flex-col items-start justify-start space-y-5 ">
            <div className="flex flex-row space-x-3  w-full ">
                {value.map((url) => (


                    <div key={url} className="relative w-[400px] h-[400px] rounded-md overflow-hidden">
                        <div className="z-10 absolute top-2 right-2">
                            <Button type="button" onClick={() => onRemove(url)} variant="destructive" size="icon">
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>


                        <Image
                            fill
                            src={url}
                            className="object-cover "
                            alt="Image"
                        />

                    </div>

                ))}
            </div>
            <CldUploadWidget onUpload={onUpload} uploadPreset="tudfiosw">
                {({ open }) => {
                    const onClick = () => {
                        open();
                    }
                    return (
                        <Button type="button"
                            variant={"secondary"}
                            disabled={disabled}
                            onClick={onClick}
                        >
                            <ImagePlus className="h-4 w-4 mr-2" />
                            upload an Image
                        </Button>
                    ) 
                }}

            </CldUploadWidget>
        </div>
    )
}

export default imageupload;