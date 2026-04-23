"use client";

import * as z from "zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import { Measurement } from "@prisma/client";
import { AlertModel } from "@/components/modals/alert-model";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { BLOUSE_STANDARD_TEMPLATE_FIELDS, BLOUSE_STANDARD_TEMPLATE_NAME } from "@/lib/data/measurement";

type TemplateSchema = {
  customer: Record<string, string>;
  measurements: Array<{ key: string; label: string; type: string }>;
  designDetails: { type: string };
};

const schema = z.object({
  name: z.string().min(1),
  fields: z.object({
    customer: z.record(z.string()),
    measurements: z
      .array(
        z.object({
          key: z.string().min(1),
          label: z.string().min(1),
          type: z.string().min(1),
        })
      )
      .min(1),
    designDetails: z.object({
      type: z.string().min(1),
    }),
  }),
});

type Values = z.infer<typeof schema>;

const cloneFields = (value: TemplateSchema): TemplateSchema => JSON.parse(JSON.stringify(value)) as TemplateSchema;

const normalizeFields = (raw: unknown): TemplateSchema => {
  if (!raw || typeof raw !== "object") {
    return cloneFields(BLOUSE_STANDARD_TEMPLATE_FIELDS as TemplateSchema);
  }

  const value = raw as Partial<TemplateSchema>;

  return {
    customer: typeof value.customer === "object" && value.customer !== null ? value.customer : { ...BLOUSE_STANDARD_TEMPLATE_FIELDS.customer },
    measurements: Array.isArray(value.measurements) && value.measurements.length > 0
      ? value.measurements.map((field) => ({
          key: String((field as { key?: string }).key || ""),
          label: String((field as { label?: string }).label || ""),
          type: String((field as { type?: string }).type || "number"),
        }))
      : [...BLOUSE_STANDARD_TEMPLATE_FIELDS.measurements],
    designDetails:
      typeof value.designDetails === "object" && value.designDetails !== null
        ? { type: String((value.designDetails as { type?: string }).type || "textarea") }
        : { ...BLOUSE_STANDARD_TEMPLATE_FIELDS.designDetails },
  };
};

export const MeasurementForm = ({
  initialData,
  templates,
}: {
  initialData: Measurement | null;
  templates: Measurement[];
}) => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const templateOptions = templates.map((template) => ({
    id: template.id,
    name: template.name,
    fields: normalizeFields(template.fields),
  }));

  const blouseTemplate =
    templateOptions.find((template) => template.name === BLOUSE_STANDARD_TEMPLATE_NAME) ||
    ({
      id: "default",
      name: BLOUSE_STANDARD_TEMPLATE_NAME,
      fields: cloneFields(BLOUSE_STANDARD_TEMPLATE_FIELDS as TemplateSchema),
    } as const);

  const initialFields = initialData ? normalizeFields(initialData.fields) : cloneFields(blouseTemplate.fields);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || blouseTemplate.name,
      fields: initialFields,
    },
  });

  const watchedMeasurements = form.watch("fields.measurements") || [];
  const watchedCustomer = form.watch("fields.customer") || {};

  const onTemplateSelect = (templateId: string) => {
    const selected = templateOptions.find((template) => template.id === templateId);
    if (!selected) return;

    form.setValue("name", selected.name);
    form.setValue("fields", cloneFields(selected.fields), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const addMeasurementField = () => {
    const next = [...watchedMeasurements, { key: "", label: "", type: "number" }];
    form.setValue("fields.measurements", next, { shouldDirty: true, shouldValidate: true });
  };

  const removeMeasurementField = (index: number) => {
    const next = watchedMeasurements.filter((_, idx) => idx !== index);
    form.setValue("fields.measurements", next.length ? next : [{ key: "", label: "", type: "number" }], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: Values) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/measurements/${params.measurementId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/measurements`, data);
      }
      toast.success("Template saved");
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
      toast.success("Template deleted");
      router.push(`/${params.storeId}/Measurements`);
      router.refresh();
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModel isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <div className="flex items-center justify-between">
        <Heading
          title={initialData ? "Edit Measurement Template" : "Create Measurement Template"}
          description="Select a template and generate the schema dynamically"
        />
        {initialData && (
          <Button variant="destructive" size="icon" onClick={() => setOpen(true)}>
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {!initialData && (
            <FormItem>
              <FormLabel>Select Template</FormLabel>
              <FormControl>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue={blouseTemplate.id}
                  onChange={(event) => onTemplateSelect(event.target.value)}
                  disabled={loading}
                >
                  {templateOptions.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </FormControl>
            </FormItem>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <Heading title="Customer Fields" description="Template-level customer metadata keys" />
            {Object.keys(watchedCustomer).map((customerKey) => (
              <FormField
                key={customerKey}
                control={form.control}
                name={`fields.customer.${customerKey}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{customerKey}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} disabled={loading} placeholder={`Default for ${customerKey}`} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <div className="space-y-3">
            <Heading title="Measurement Fields" description="Generated from selected template schema" />
            {watchedMeasurements.map((_, index) => (
              <div key={`measurement-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <FormField
                  control={form.control}
                  name={`fields.measurements.${index}.key`}
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
                  name={`fields.measurements.${index}.label`}
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
                  name={`fields.measurements.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-8">
                  <Button type="button" variant="destructive" onClick={() => removeMeasurementField(index)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addMeasurementField}>
              Add Measurement Field
            </Button>
          </div>

          <FormField
            control={form.control}
            name="fields.designDetails.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Design Details Input Type</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || "textarea"} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading}>
            Save Template
          </Button>
        </form>
      </Form>
    </>
  );
};
