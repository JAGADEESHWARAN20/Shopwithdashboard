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

const formSchema = z.object({
  label: z.string().min(1),
  imageUrl: z.string().min(1),
  description: z.string().optional(),
  tags: z.string().optional(),
});

type DesignFormValues = z.infer<typeof formSchema>;

type VariationInput = {
  label: string;
  imageUrl: string;
  value: string;
};

interface DesignFormProps {
  initialData: any;
}

export const DesignForm: React.FC<DesignFormProps> = ({ initialData }) => {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [variations, setVariations] = useState<VariationInput[]>(
    initialData?.variations?.length
      ? initialData.variations.map((variation: any) => ({
          label: variation.label,
          imageUrl: variation.imageUrl,
          value: variation.value || "",
        }))
      : [{ label: "Variation 1", imageUrl: "", value: "" }]
  );

  const form = useForm<DesignFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          label: initialData.title,
          imageUrl: initialData.imageUrl,
          description: initialData.description || "",
          tags: initialData.tags?.join(", ") || "",
        }
      : {
          label: "",
          imageUrl: "",
          description: "",
          tags: "",
        },
  });

  const updateVariation = (index: number, key: keyof VariationInput, value: string) => {
    setVariations((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addVariation = () => {
    setVariations((prev) => [...prev, { label: `Variation ${prev.length + 1}`, imageUrl: "", value: "" }]);
  };

  const removeVariation = (index: number) => {
    setVariations((prev) => prev.filter((_, idx) => idx !== index));
  };

  const onSubmit = async (data: DesignFormValues) => {
    const preparedVariations = variations
      .filter((item) => item.label && item.imageUrl)
      .map((item, index) => ({
        label: item.label,
        imageUrl: item.imageUrl,
        value: item.value || null,
        sortOrder: index,
        isActive: true,
      }));

    if (!preparedVariations.length) {
      toast.error("At least one variation image is required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...data,
        variations: preparedVariations,
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
          title={initialData ? "Edit Design Group" : "Create Design Group"}
          description="One group (front/back/skirt) can contain many variation images"
        />
        {initialData && (
          <Button type="button" variant="destructive" size="sm" onClick={() => setOpen(true)}>
            <Trash className="w-4 h-4" />
          </Button>
        )}
      </div>
      <Separator />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Input placeholder="Design group label (Lehanga Blouse Front)" {...form.register("label")} />
        <Input placeholder="Group description (optional)" {...form.register("description")} />
        <Input placeholder="Tags comma-separated (optional filters)" {...form.register("tags")} />

        <ImageUpload
          value={form.watch("imageUrl")}
          disabled={loading}
          folder="designs"
          onChange={(url) => form.setValue("imageUrl", url)}
          onRemove={() => form.setValue("imageUrl", "")}
        />

        <Separator />

        <Heading title="Variations" description="Add all variation images and labels" />

        <div className="space-y-6">
          {variations.map((variation, index) => (
            <div key={index} className="space-y-3 rounded-md border p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Input
                  placeholder="Variation label (e.g. V-01)"
                  value={variation.label}
                  onChange={(e) => updateVariation(index, "label", e.target.value)}
                  disabled={loading}
                />
                <Input
                  placeholder="Value/tag (optional)"
                  value={variation.value}
                  onChange={(e) => updateVariation(index, "value", e.target.value)}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="destructive"
                  disabled={loading || variations.length === 1}
                  onClick={() => removeVariation(index)}
                >
                  Remove
                </Button>
              </div>

              <ImageUpload
                value={variation.imageUrl}
                disabled={loading}
                folder="designs"
                onChange={(url) => updateVariation(index, "imageUrl", url)}
                onRemove={() => updateVariation(index, "imageUrl", "")}
              />
            </div>
          ))}
        </div>

        <Button type="button" variant="secondary" onClick={addVariation} disabled={loading}>
          Add Another Variation
        </Button>

        <Button disabled={loading} type="submit">
          Save
        </Button>
      </form>
    </>
  );
};
