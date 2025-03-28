"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "react-hot-toast";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";


interface SettingsFormProps {
  initialData: any; // Store data
}

const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const { userId } = useAuth();
  const params = useParams();
  const router = useRouter();

  const [name, setName] = useState(initialData.name);
  const [isActive, setIsActive] = useState(initialData.isActive);
  const [domainToRemove, setDomainToRemove] = useState("");
  const [domainToAdd, setDomainToAdd] = useState("");
  const [currentDomains, setCurrentDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [domainLoading, setDomainLoading] = useState(false);
  const [pendingDomain, setPendingDomain] = useState<string | null>(null);

  useEffect(() => {
    const fetchDomains = async () => {
      if (!userId || !params.storeId) {
        console.error("Missing userId or storeId:", { userId, storeId: params.storeId });
        toast.error("Invalid user or store ID");
        return;
      }

      try {
        const response = await axios.get(`/api/stores/${params.storeId}/list-domains?userId=${userId}`);
        const domains = response.data.map((domain: any) => domain.name);
        setCurrentDomains(domains);
      } catch (error: any) {
        console.error("Error fetching domains:", error.response?.data || error.message);
        toast.error("Failed to fetch current domains");
      }
    };

    if (userId) {
      fetchDomains();
    }
  }, [userId, params.storeId]);
  
  const onSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.patch(`/api/stores/${params.storeId}`, {
        name,
        isActive,
        userId,
      });

      // If the store name changes, calculate the new domain but don't apply it yet
      if (name !== initialData.name) {
        const newDomain = `${name.toLowerCase().replace(/\s+/g, "-")}-ecommercestore-online.vercel.app`;
        setPendingDomain(newDomain); // Store the new domain temporarily
        toast.success("Store name updated. Click 'Refresh URL' to update the store URL.");
      } else {
        toast.success("Store updated successfully");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update store");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshUrl = async () => {
    if (!pendingDomain) {
      toast.error("No pending domain to apply.");
      return;
    }

    try {
      setLoading(true);

      // Extract the subdomain from pendingDomain
      const subdomain = pendingDomain.replace(`-ecommercestore-online.vercel.app`, ``);

      // Validate the new domain using the correct route
      const validateResponse = await axios.get(
        `/api/stores/${params.storeId}/${subdomain}`
      );

      if (validateResponse.status !== 200) {
        toast.error("The new store name is invalid.");
        return;
      }

      await axios.post(`/api/stores/${params.storeId}/manage-domains`, {
        userId,
        domainToRemove: initialData.storeUrl?.replace("https://", ""),
        domainToAdd: pendingDomain,
      });

      toast.success("Store URL updated successfully");
      setPendingDomain(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update store URL");
    } finally {
      setLoading(false);
    }
  };

  const handleManageDomains = async () => {
    try {
      setDomainLoading(true);
      const response = await axios.post(`/api/stores/${params.storeId}/manage-domains`, {
        userId,
        domainToRemove: domainToRemove || undefined,
        domainToAdd: domainToAdd || undefined,
      });
      if (response.status === 200) {
        toast.success("Domains managed successfully");
        setDomainToRemove("");
        setDomainToAdd("");
        const domainsResponse = await axios.get(`/api/stores/${params.storeId}/list-domains?userId=${userId}`);
        const domains = domainsResponse.data.map((domain: any) => domain.name);
        setCurrentDomains(domains);
        router.refresh();
      } else {
        toast.error("Failed to manage domains");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to manage domains");
    } finally {
      setDomainLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
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
            <Checkbox
              id="is-active"
              checked={isActive}
              onCheckedChange={(checked: boolean) => setIsActive(checked)}
            />
            <Label htmlFor="is-active">Active</Label>
          </div>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Store URL and Preview Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Store URL</CardTitle>
              <CardDescription>View and preview your store URL.</CardDescription>
            </div>
            {pendingDomain && (
              <Button onClick={handleRefreshUrl} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh URL"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current URL</Label>
            <p className="mt-1 text-sm text-gray-600">{initialData.storeUrl || "No URL set"}</p>
          </div>
          <div className="space-y-2">
            <Label>Store Preview</Label>
            <div className="relative w-full h-64 border rounded-md overflow-hidden">
              {initialData.storeUrl ? (
                <iframe
                  src={initialData.storeUrl}
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

      {/* Manage Domains Card */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Domains</CardTitle>
          <CardDescription>Add or remove domains for your store.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Domains</Label>
            {currentDomains.length > 0 ? (
              <ul className="list-disc pl-5 mt-1 text-sm text-gray-600">
                {currentDomains.map((domain) => (
                  <li key={domain}>{domain}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-gray-600">No domains found.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain-to-remove">Domain to Remove (optional)</Label>
            <Input
              id="domain-to-remove"
              value={domainToRemove}
              onChange={(e) => setDomainToRemove(e.target.value)}
              placeholder="e.g., oldstore-ecommercestore-online.vercel.app"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain-to-add">Domain to Add (optional)</Label>
            <Input
              id="domain-to-add"
              value={domainToAdd}
              onChange={(e) => setDomainToAdd(e.target.value)}
              placeholder="e.g., newstore-ecommercestore-online.vercel.app"
            />
          </div>
          <Button onClick={handleManageDomains} disabled={domainLoading}>
            {domainLoading ? "Managing Domains..." : "Manage Domains"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsForm;