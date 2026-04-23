import { MeasurementForm } from "./components/measurement-form";
import { getMeasurementById, getMeasurements } from "@/lib/data/measurement";

const MeasurementPage = async ({ params }: { params: Promise<{ storeId: string; measurementId: string }> }) => {
  const { storeId, measurementId } = await params;

  const [measurement, templates] = await Promise.all([
    measurementId === "new" ? null : getMeasurementById(measurementId),
    getMeasurements(storeId),
  ]);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <MeasurementForm initialData={measurement} templates={templates} />
      </div>
    </div>
  );
};

export default MeasurementPage;
