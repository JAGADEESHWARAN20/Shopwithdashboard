"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import ImageUpload from "@/components/ui/image-upload";
import { AlertModel } from "@/components/modals/alert-model";
import { DesignItem } from "@prisma/client";

const formSchema = z.object({
  label: z.string().min(1),
  imageUrl: z.string().min(1),
  description: z.string().optional(),
  tags: z.string().optional(),
});

type DesignFormValues = z.infer<typeof formSchema>;

interface DesignFormProps {
  initialData: DesignItem | null;
}

export const DesignForm: React.FC<DesignFormProps> = ({ initialData }) => {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<DesignFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          label: initialData.title,
          imageUrl: initialData.imageUrl,
          description: initialData.description || "",
          tags: initialData.tags.join(", "),
        }
      : {
          label: "",
          imageUrl: "",
          description: "",
          tags: "",
        },
  });

  const onSubmit = async (data: DesignFormValues) => {
    try {
      setLoading(true);

      const payload = {
        ...data,
        tags: data.tags
          ? data.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      };

      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/design-collections/${params.collectionId}/designs/${params.designId}`,
          payload
        );
      } else {
        await axios.post(
          `/api/${params.storeId}/design-collections/${params.collectionId}/designs`,
          payload
        );
      }

      router.push(`/${params.storeId}/design-collections/${params.collectionId}`);
      router.refresh();
      toast.success("Saved");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);

      await axios.delete(
        `/api/${params.storeId}/design-collections/${params.collectionId}/designs/${params.designId}`
      );

      router.push(`/${params.storeId}/design-collections/${params.collectionId}`);
      router.refresh();
      toast.success("Deleted");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModel
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />

      <div className="flex items-center justify-between">
        <Heading
          title={initialData ? "Edit Design" : "Create Design"}
          description="Add design item to this collection"
        />
        {initialData && (
          <Button type="button" variant="destructive" size="sm" onClick={() => setOpen(true)}>
            <Trash className="w-4 h-4" />
          </Button>
        )}
      </div>
      <Separator />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Input placeholder="Design Label" {...form.register("label")} />
        <Input placeholder="Short description (optional)" {...form.register("description")} />
        <Input placeholder="Tags comma-separated (optional)" {...form.register("tags")} />

        <ImageUpload
          value={form.watch("imageUrl")}
          disabled={loading}
          folder="designs"
          onChange={(url) => form.setValue("imageUrl", url)}
          onRemove={() => form.setValue("imageUrl", "")}
        />

        <Button disabled={loading} type="submit">
          Save
        </Button>
      </form>
    </>
  );
};
