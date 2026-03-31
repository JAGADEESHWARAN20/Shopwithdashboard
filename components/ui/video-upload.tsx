"use client";

import { useEffect, useState } from "react";
import { Video, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CldUploadWidget,
  type CloudinaryUploadWidgetResults,
} from "next-cloudinary";

interface VideoUploadProps {
  disabled?: boolean;
  value?: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
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
        <div className="relative w-full max-w-xl aspect-video rounded-md overflow-hidden border">
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
          
          {/* Replaced <Image /> with standard HTML5 <video /> */}
          <video 
            src={value} 
            autoPlay 
            loop 
            muted 
            playsInline
            className="object-cover w-full h-full" 
          />
        </div>
      )}

      <CldUploadWidget 
        uploadPreset="tudfiosw" 
        onSuccess={handleUpload}
        options={{
          maxFiles: 1,
          resourceType: "video", // Forces Cloudinary to expect a video file
          clientAllowedFormats: ["mp4", "webm", "ogg", "mov"] 
        }}
      >
        {({ open }) => (
          <Button
            type="button"
            variant="secondary"
            disabled={disabled}
            onClick={() => open()}
          >
            <Video className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
};

export default VideoUpload;