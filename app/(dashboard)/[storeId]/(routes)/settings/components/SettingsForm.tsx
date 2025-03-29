"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import {Switch} from "@/components/ui/switch"

// Define the StoreUrl type (as previously used)
interface StoreUrl {
  storeUrl: string;
  statusactive: boolean;
  userId: string;
}

interface SettingsFormProps {
  initialData: {
    name: string;
    isActive: boolean;
    storeUrl: string | null | StoreUrl; // Allow null to match Prisma type
    alternateUrls: string[];
  };
}

const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const { userId } = useAuth();
  const params = useParams();
  const router = useRouter();

  const [name, setName] = useState(initialData.name);
  const [isActive, setIsActive] = useState(initialData.isActive);
  const [storeUrl, setStoreUrl] = useState<StoreUrl | string | null>(
    typeof initialData.storeUrl === "string" || initialData.storeUrl === null
      ? initialData.storeUrl
      : initialData.storeUrl
  );
  const [alternateUrls, setAlternateUrls] = useState<string[]>(initialData.alternateUrls || []);
  const [newAlternateUrl, setNewAlternateUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [wsStatus, setWsStatus] = useState("Disconnected");

  useEffect(() => {
    const ws = new WebSocket("wss://admindashboardecom.vercel.app");
    ws.onopen = () => setWsStatus("Connected");
    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === "storeUpdate") {
        setNotification("Store settings updated successfully");
        setStoreUrl(data.storeUrl);
        setAlternateUrls(data.alternateUrls || []);
      }
    };
    ws.onclose = () => setWsStatus("Disconnected");
    ws.onerror = (error) => console.error("WebSocket error:", error);
    return () => ws.close();
  }, []);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${params.storeId}`, {
        name,
        isActive,
        storeUrl,
        alternateUrls,
        userId,
      });
      toast.success("Store updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update store");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlternateUrl = async () => {
    if (!newAlternateUrl) {
      toast.error("Please enter a valid URL");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(`/api/stores/${params.storeId}/manage-domains`, {
        userId,
        domainToAdd: newAlternateUrl,
      });
      setAlternateUrls([...alternateUrls, `https://${newAlternateUrl}`]);
      setNewAlternateUrl("");
      toast.success("Alternate URL added successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add alternate URL");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAlternateUrl = async (url: string) => {
    try {
      setLoading(true);
      const domainToRemove = url.replace("https://", "");
      await axios.post(`/api/stores/${params.storeId}/manage-domains`, {
        userId,
        domainToRemove,
      });
      setAlternateUrls(alternateUrls.filter((u) => u !== url));
      toast.success("Alternate URL removed successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to remove alternate URL");
    } finally {
      setLoading(false);
    }
  };

  // Helper to render storeUrl for display
  const displayStoreUrl = typeof storeUrl === "string" || storeUrl === null
    ? storeUrl
    : storeUrl.storeUrl;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center mb-4">
        <span className={`w-4 h-4 rounded-full mr-2 ${wsStatus === "Connected" ? "bg-green-500" : "bg-red-500"}`}></span>
        <span>WebSocket {wsStatus}</span>
      </div>

      {/* Store Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
          <CardDescription>Update your store name and status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">Store Name</Label>
            <Input
              id="store-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter store name"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={(checked: boolean) => setIsActive(checked)}
            />
            <Label htmlFor="is-active">Active</Label>
          </div>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Store URL Card */}
      <Card>
        <CardHeader>
          <CardTitle>Store URL</CardTitle>
          <CardDescription>View and manage your store URL.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Primary Store URL</h3>
            <Label>URL</Label>
            <Input
              value={typeof storeUrl === "string" ? storeUrl : storeUrl?.storeUrl || ""}
              onChange={(e) => {
                if (typeof storeUrl === "string" || storeUrl === null) {
                  setStoreUrl(e.target.value);
                } else {
                  setStoreUrl({ ...storeUrl, storeUrl: e.target.value });
                }
              }}
              placeholder="Enter store URL"
            />
            {typeof storeUrl === "object" && storeUrl !== null && (
              <>
                <Label className="mt-2">URL Active</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={storeUrl.statusactive}
                    onCheckedChange={(checked: boolean) =>
                      setStoreUrl({ ...storeUrl, statusactive: checked })
                    }
                  />
                  <Label>Active</Label>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Associated User ID: {storeUrl.userId}
                </p>
              </>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Alternate URLs</h3>
            {alternateUrls.length > 0 ? (
              <ul className="list-disc pl-5 mt-1 text-sm text-gray-600">
                {alternateUrls.map((url) => (
                  <li key={url} className="flex items-center">
                    {url}
                    <Button
                      variant="link"
                      className="text-red-500 ml-2"
                      onClick={() => handleRemoveAlternateUrl(url)}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-gray-600">No alternate URLs found.</p>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <Input
                value={newAlternateUrl}
                onChange={(e) => setNewAlternateUrl(e.target.value)}
                placeholder="Add Alternate URL"
              />
              <Button onClick={handleAddAlternateUrl} disabled={loading}>
                Add
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Store Preview</Label>
            <div className="relative w-full h-64 border rounded-md overflow-hidden">
              {displayStoreUrl ? (
                <iframe
                  src={displayStoreUrl}
                  title="Store Preview"
                  className="w-full h-full border-none"
                  style={{
                    transform: "scale(0.5)",
                    transformOrigin: "top left",
                    width: "200%",
                    height: "200%",
                    pointerEvents: "none",
                  }}
                  scrolling="no"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No store URL available for preview.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {notification && (
        <div className="mt-4 p-2 bg-green-100 text-green-700">{notification}</div>
      )}
    </div>
  );
};

export default SettingsForm;