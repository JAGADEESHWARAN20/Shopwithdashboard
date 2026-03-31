"use client";

import { useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SettingsFormProps {
  initialData: {
    name: string;
    isActive: boolean;
    storeUrl: string | null;
    alternateUrls: string[];
    logoUrl?: string | null;
  };
}

const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const [name, setName] = useState(initialData.name);
  const [isActive, setIsActive] = useState(initialData.isActive);
  const [storeUrl, setStoreUrl] = useState(initialData.storeUrl || "");
  const [alternateUrls, setAlternateUrls] = useState(
    initialData.alternateUrls || []
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(
    initialData.logoUrl || null
  );

  const [showPreview, setShowPreview] = useState(true);
  const [loading, setLoading] = useState(false);

  const displayStoreUrl = storeUrl || alternateUrls[0] || "";

  // 🔥 Upload Logo
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "YOUR_UPLOAD_PRESET"); // 🔥 replace
    formData.append("cloud_name", "YOUR_CLOUD_NAME"); // 🔥 replace

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    setLogoUrl(data.secure_url);
  };

  // 🔥 Submit
  const onSubmit = async () => {
    try {
      setLoading(true);

      await axios.patch(`/api/stores/${params.storeId}`, {
        name,
        isActive,
        storeUrl,
        alternateUrls,
        logoUrl,
      });

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">

      {/* 🔹 Store Name */}
      <div className="space-y-2">
        <Label>Store Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      {/* 🔹 Active Toggle */}
      <div className="flex items-center justify-between">
        <Label>Store Active</Label>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>

      {/* 🔹 Logo Upload */}
      <div className="space-y-3">
        <Label>Store Logo</Label>

        <div className="flex items-center gap-4">

          {/* Preview */}
          <div className="w-20 h-20 rounded-xl border border-white/10 bg-black/20 flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="logo"
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-xs text-gray-400">No Logo</span>
            )}
          </div>

          {/* Upload Button */}
          <label className="cursor-pointer px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-white border border-white/10 transition">
            Upload Logo
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
          </label>

          {/* Remove */}
          {logoUrl && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setLogoUrl(null)}
            >
              <Trash size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* 🔹 Store URL */}
      <div className="space-y-2">
        <Label>Store URL</Label>
        <Input
          value={storeUrl}
          onChange={(e) => setStoreUrl(e.target.value)}
        />
      </div>

      {/* 🔹 Preview Toggle */}
      <div className="space-y-3">
        <Label>Preview Site</Label>

        <div className="flex items-center gap-3">
          <Switch checked={showPreview} onCheckedChange={setShowPreview} />
          <span className="text-sm text-gray-300">
            {showPreview ? "Preview Enabled" : "Preview Disabled"}
          </span>
        </div>

        {showPreview && (
          <div className="relative w-full h-64 rounded-xl overflow-hidden border border-white/10 bg-black">
            {displayStoreUrl ? (
              <iframe
                src={displayStoreUrl}
                className="w-full h-full border-none scale-50 origin-top-left pointer-events-none"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No preview available
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🔹 Submit */}
      <Button
        disabled={loading}
        onClick={onSubmit}
        className="w-full bg-white text-black hover:bg-gray-200"
      >
        Save Changes
      </Button>
    </div>
  );
};

export default SettingsForm;