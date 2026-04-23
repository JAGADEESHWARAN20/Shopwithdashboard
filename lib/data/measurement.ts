import { cache } from "react";
import prismadb from "@/lib/prismadb";

export const BLOUSE_STANDARD_TEMPLATE_NAME = "Blouse Standard Template";

export const BLOUSE_STANDARD_TEMPLATE_FIELDS = {
  customer: {
    name: "",
    contact: "",
    email: "",
    address: "",
    orderNo: "",
    deliveryDate: "",
  },
  measurements: [
    { key: "blouseLength", label: "Blouse Length", type: "number" },
    { key: "shoulder", label: "Shoulder", type: "number" },
    { key: "frontNeckDepth", label: "Front Neck Depth", type: "number" },
    { key: "backNeckDepth", label: "Back Neck Depth", type: "number" },
    { key: "upperBust", label: "Upper Bust", type: "number" },
    { key: "bust", label: "Bust", type: "number" },
    { key: "lowerBust", label: "Lower Bust", type: "number" },
    { key: "waist", label: "Waist", type: "number" },
    { key: "armhole", label: "Armhole", type: "number" },
    { key: "sleeveLength", label: "Sleeve Length", type: "number" },
    { key: "sleeveRound", label: "Sleeve Round", type: "number" },
    { key: "shoulderToBustPoint", label: "Shoulder to Bust Point", type: "number" },
    { key: "dartToDart", label: "Dart to Dart", type: "number" },
  ],
  designDetails: {
    type: "textarea",
  },
} as const;

function cloneTemplateFields<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function ensureDefaultMeasurementTemplate(storeId: string) {
  const existing = await prismadb.measurement.findFirst({
    where: {
      storeId,
      name: BLOUSE_STANDARD_TEMPLATE_NAME,
    },
  });

  if (existing) {
    return existing;
  }

  return prismadb.measurement.create({
    data: {
      storeId,
      name: BLOUSE_STANDARD_TEMPLATE_NAME,
      fields: cloneTemplateFields(BLOUSE_STANDARD_TEMPLATE_FIELDS),
    },
  });
}

export const getMeasurements = cache(async (storeId: string) => {
  await ensureDefaultMeasurementTemplate(storeId);

  return prismadb.measurement.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });
});


export const getMeasurementById = cache(async (measurementId: string) => {
  return prismadb.measurement.findUnique({ where: { id: measurementId } });
});

export async function createMeasurementTemplate(storeId: string, data: { name: string; fields: unknown }) {
  return prismadb.measurement.create({
    data: {
      storeId,
      name: data.name,
      fields: data.fields,
    },
  });
}

export async function updateMeasurementTemplate(measurementId: string, data: { name: string; fields: unknown }) {
  return prismadb.measurement.update({
    where: { id: measurementId },
    data: {
      name: data.name,
      fields: data.fields,
    },
  });
}
