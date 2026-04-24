"use client";
import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useFieldArray } from "react-hook-form";
import { ChangeEvent, useRef, useState } from "react";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import { Measurement } from "@prisma/client";
import { AlertModel } from "@/components/modals/alert-model";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  name: z.string().min(1),
  fields: z
    .array(
      z.object({
        key: z.string().min(1),
        label: z.string().min(1),
        unit: z.string().optional(),
      })
    )
    .min(1),
});
type Values = z.infer<typeof schema>;
type TemplateField = Values["fields"][number];

const STANDARD_TEMPLATE_FIELDS: TemplateField[] = [{ key: "chest", label: "Chest", unit: "in" }];
const BLOUSE_TEMPLATE_FIELDS: TemplateField[] = [
  { key: "blouse_length", label: "Blouse Length", unit: "in" },
  { key: "shoulder", label: "Shoulder", unit: "in" },
  { key: "front_neck_depth", label: "Front Neck Depth", unit: "in" },
  { key: "back_neck_depth", label: "Back Neck Depth", unit: "in" },
  { key: "upper_bust", label: "Upper Bust", unit: "in" },
  { key: "bust", label: "Bust", unit: "in" },
  { key: "lower_bust", label: "Lower Bust", unit: "in" },
  { key: "waist", label: "Waist", unit: "in" },
  { key: "armhole", label: "Armhole", unit: "in" },
  { key: "sleeve_length", label: "Sleeve Length", unit: "in" },
  { key: "sleeve_round", label: "Sleeve Round", unit: "in" },
  { key: "shoulder_to_bust_point", label: "Shoulder To Bust Point", unit: "in" },
  { key: "dart_to_dart", label: "Dart To Dart", unit: "in" },
];

const STANDARD_TEMPLATE_EXAMPLE = `{
  "name": "Blouse Measurement Sheet",
  "fields": [
    { "key": "blouse_length", "label": "Blouse Length", "unit": "in" },
    { "key": "shoulder", "label": "Shoulder", "unit": "in" },
    { "key": "front_neck_depth", "label": "Front Neck Depth", "unit": "in" }
  ]
}`;

export const MeasurementForm = ({ initialData }: { initialData: Measurement | null }) => {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          fields: (initialData.fields as Values["fields"]) || [],
        }
      : {
          name: "",
          fields: [{ key: "chest", label: "Chest", unit: "in" }],
        },
  });
  const fieldsArray = useFieldArray({ control: form.control, name: "fields" });

  const applyTemplate = (templateName: string, templateFields: TemplateField[]) => {
    form.setValue("fields", templateFields, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    if (!initialData) {
      form.setValue("name", templateName, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
    toast.success(`${templateName} preset applied`);
  };

  const onSubmit = async (data: Values) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/measurements/${params.measurementId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/measurements`, data);
      }
      toast.success("Saved");
      router.push(`/${params.storeId}/Measurements`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/measurements/${params.measurementId}`);
      toast.success("Deleted");
      router.push(`/${params.storeId}/Measurements`);
      router.refresh();
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const parseAndApplyTemplate = (rawData: unknown) => {
    const payload = rawData as { name?: unknown; fields?: unknown } | unknown[];
    const importedFields = Array.isArray(payload)
      ? payload
      : payload && typeof payload === "object" && "fields" in payload
      ? (payload as { fields?: unknown }).fields
      : undefined;

    if (!Array.isArray(importedFields)) {
      throw new Error("JSON must be an array of fields or an object with a fields array.");
    }

    const validatedFields = importedFields.map((field, index) => {
      if (!field || typeof field !== "object") {
        throw new Error(`Field at index ${index} is invalid.`);
      }
      const item = field as { key?: unknown; label?: unknown; unit?: unknown };
      if (!item.key || typeof item.key !== "string") {
        throw new Error(`Field ${index + 1} is missing a valid key.`);
      }
      if (!item.label || typeof item.label !== "string") {
        throw new Error(`Field ${index + 1} is missing a valid label.`);
      }
      return {
        key: item.key.trim(),
        label: item.label.trim(),
        unit: typeof item.unit === "string" ? item.unit.trim() : "",
      };
    });

    if (!validatedFields.length) {
      throw new Error("Template must contain at least one field.");
    }

    form.setValue("fields", validatedFields, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    if (payload && typeof payload === "object" && "name" in payload) {
      const nameValue = (payload as { name?: unknown }).name;
      if (typeof nameValue === "string" && nameValue.trim()) {
        form.setValue("name", nameValue.trim(), { shouldDirty: true, shouldTouch: true, shouldValidate: true });
      }
    }
  };

  const onJsonFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const parsed = JSON.parse(content) as unknown;
      parseAndApplyTemplate(parsed);
      toast.success("Template imported from JSON");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON file";
      toast.error(message);
    } finally {
      event.target.value = "";
    }
  };

  return <>
    <AlertModel isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
    <div className="flex items-center justify-between">
      <Heading
        title={initialData ? "Edit Measurement" : "Create Measurement"}
        description="Build a dynamic measurement template"
      />
      {initialData && (
        <Button variant="destructive" size="icon" onClick={() => setOpen(true)}>
          <Trash className="h-4 w-4" />
        </Button>
      )}
    </div>
    <Separator />
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={onJsonFileUpload}
            aria-label="Upload measurement template JSON file"
            className="hidden"
          />
          <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Upload JSON Template
          </Button>
          <p className="text-sm text-muted-foreground">Import array of fields or {"{ name, fields }"} JSON.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Template Type:</span>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => applyTemplate("Standard Measurement", STANDARD_TEMPLATE_FIELDS)}
          >
            Standard
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => applyTemplate("Blouse Measurement Sheet", BLOUSE_TEMPLATE_FIELDS)}
          >
            Blouse Measurement Sheet
          </Button>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {fieldsArray.fields.map((f, index) => (
          <div key={f.id} className="grid grid-cols-1 gap-3 rounded-md border p-4 md:grid-cols-4">
            <FormField
              control={form.control}
              name={`fields.${index}.key`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`fields.${index}.label`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`fields.${index}.unit`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} disabled={loading} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex items-end">
              <Button
                type="button"
                variant="destructive"
                onClick={() => fieldsArray.remove(index)}
                disabled={fieldsArray.fields.length === 1 || loading}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}

        <Button type="button" variant="secondary" onClick={() => fieldsArray.append({ key: "", label: "", unit: "in" })}>
          Add Field
        </Button>
        <div className="rounded-md border bg-slate-50 p-3 text-xs text-slate-700">
          <p className="mb-2 font-semibold">Standard JSON Template Format</p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-all">{STANDARD_TEMPLATE_EXAMPLE}</pre>
        </div>
        <Button type="submit" disabled={loading}>
          Save
        </Button>
      </form>
    </Form>
  </>;
};
