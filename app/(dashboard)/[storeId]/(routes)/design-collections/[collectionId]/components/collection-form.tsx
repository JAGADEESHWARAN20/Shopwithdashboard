"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import toast from "react-hot-toast";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import ImageUpload from "@/components/ui/image-upload";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  label: z.string().min(1),
  coverImage: z.string().min(1),
  slug: z.string().min(1),
  isFeatured: z.boolean().default(false).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const DesignCollectionForm = ({ initialData }: any) => {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [designLoading, setDesignLoading] = useState(false);

  const [designLabel, setDesignLabel] = useState("");
  const [designImageUrl, setDesignImageUrl] = useState("");
  const [designValues, setDesignValues] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          label: initialData.label,
          coverImage: initialData.coverImage,
          slug: initialData.slug,
          isFeatured: initialData.isFeatured ?? false,
        }
      : {
          label: "",
          coverImage: "",
          slug: "",
          isFeatured: false,
        },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/design-collections/${params.collectionId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/design-collections`, data);
      }

      router.push(`/${params.storeId}/design-collections`);
      router.refresh();
      toast.success("Collection saved");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onAddDesignToCollection = async () => {
    if (!initialData) {
      toast.error("Save collection first before adding designs");
      return;
    }

    if (!designLabel || !designImageUrl) {
      toast.error("Design label and image are required");
      return;
    }

    try {
      setDesignLoading(true);

      await axios.post(
        `/api/${params.storeId}/design-collections/${params.collectionId}/designs`,
        {
          label: designLabel,
          imageUrl: designImageUrl,
          values: designValues
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }
      );

      setDesignLabel("");
      setDesignImageUrl("");
      setDesignValues("");
      toast.success("Design added to collection");
      router.refresh();
    } catch {
      toast.error("Failed to add design");
    } finally {
      setDesignLoading(false);
    }
  };

  return (
    <>
      <Heading
        title={initialData ? "Collection" : "Create Collection"}
        description={
          initialData
            ? "Manage collection and add relevant design items by label and image"
            : "Create a collection first, then add designs"
        }
      />
      <Separator />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Input placeholder="Collection label" {...form.register("label")} />
        <Input placeholder="Slug" {...form.register("slug")} />

        <div className="flex items-center space-x-3 rounded-md border p-3">
          <Checkbox
            id="isFeatured"
            checked={form.watch("isFeatured")}
            onCheckedChange={(value) => form.setValue("isFeatured", Boolean(value))}
          />
          <Label htmlFor="isFeatured">Featured Collection</Label>
        </div>

        <ImageUpload
          value={form.watch("coverImage")}
          disabled={loading}
          folder="collections"
          onChange={(url) => form.setValue("coverImage", url)}
          onRemove={() => form.setValue("coverImage", "")}
        />

        <Button disabled={loading} type="submit">
          Save Collection
        </Button>
      </form>

      {initialData && (
        <>
          <Separator />

          <div className="space-y-4 rounded-md border p-4">
            <Heading
              title="Quick Add Design"
              description="Add relevant design to this collection (example: Front Design)"
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                placeholder="Design label (e.g., Front Design)"
                value={designLabel}
                onChange={(e) => setDesignLabel(e.target.value)}
                disabled={designLoading}
              />

              <Input
                placeholder="Values (comma separated)"
                value={designValues}
                onChange={(e) => setDesignValues(e.target.value)}
                disabled={designLoading}
              />
            </div>

            <ImageUpload
              value={designImageUrl}
              disabled={designLoading}
              folder="designs"
              onChange={setDesignImageUrl}
              onRemove={() => setDesignImageUrl("")}
            />

            <Button type="button" onClick={onAddDesignToCollection} disabled={designLoading}>
              Add Design to Collection
            </Button>
          </div>
        </>
      )}
    </>
  );
};
