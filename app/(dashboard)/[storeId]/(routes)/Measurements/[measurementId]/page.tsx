import prismadb from "@/lib/prismadb";
import { MeasurementForm } from "./components/measurement-form";

const MeasurementPage = async ({ params }: { params: Promise<{ measurementId: string }> }) => {
  const { measurementId } = await params;
  const measurement = measurementId === "new" ? null : await prismadb.measurement.findUnique({ where: { id: measurementId } });
  return <div className="flex-col"><div className="flex-1 space-y-4 p-8 pt-6"><MeasurementForm initialData={measurement} /></div></div>;
};

export default MeasurementPage;
