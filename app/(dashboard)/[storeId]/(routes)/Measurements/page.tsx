import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { MeasurementClient } from "./components/client";

export type MeasurementRow = { id: string; name: string; fieldCount: number; createdAt: string };

const MeasurementsPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;
  const measurements = await prismadb.measurement.findMany({ where: { storeId }, orderBy: { createdAt: "desc" } });
  const data: MeasurementRow[] = measurements.map((m) => ({
    id: m.id,
    name: m.name,
    fieldCount: Array.isArray(m.fields) ? m.fields.length : 0,
    createdAt: format(m.createdAt, "MMMM do, yyyy"),
  }));

  return <div className="flex-col"><div className="flex-1 space-y-4 p-8 pt-6"><MeasurementClient data={data} /></div></div>;
};

export default MeasurementsPage;
