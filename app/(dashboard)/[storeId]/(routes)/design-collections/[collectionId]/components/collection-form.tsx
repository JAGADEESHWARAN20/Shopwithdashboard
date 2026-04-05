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
      toast.success("Saved");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Heading
        title={initialData ? "Collection" : "Create Collection"}
        description={
          initialData
            ? "Manage collection and add multiple design items by collection id"
            : "Create a collection first, then add designs"
        }
      />
      <Separator />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Input placeholder="Label" {...form.register("label")} />
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
          Save
        </Button>
      </form>
    </>
  );
};
