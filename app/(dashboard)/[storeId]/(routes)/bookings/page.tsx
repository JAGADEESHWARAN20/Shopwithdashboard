import { BookingClient } from "./components/client";
import prismadb from "@/lib/prismadb";
import { BookingStatusValue } from "./components/column";

type BookingRow = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  region: string;
  bookingType: string;
  bookingValue: number;
  advanceAmount: number;
  appointmentDate: string | null;
  createdAt: string;
  status: BookingStatusValue;
};

type BookingRecord = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  region: string;
  bookingType: string | null;
  bookingValue: number;
  advanceAmount: number;
  appointmentDate: Date | null;
  createdAt: Date;
  status: BookingStatusValue;
};

const BookingsPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;
  const bookingOrderDelegate = (
    prismadb as typeof prismadb & {
      bookingOrder: {
        findMany: (args: object) => Promise<BookingRecord[]>;
      };
    }
  ).bookingOrder;

  const bookings = await bookingOrderDelegate.findMany({
    where: {
      storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const data: BookingRow[] = bookings.map((booking: BookingRecord) => ({
    id: booking.id,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    customerEmail: booking.customerEmail ?? "No email",
    region: booking.region,
    bookingType: booking.bookingType ?? "General consultation",
    bookingValue: Number(booking.bookingValue),
    advanceAmount: Number(booking.advanceAmount),
    appointmentDate: booking.appointmentDate ? booking.appointmentDate.toISOString() : null,
    createdAt: booking.createdAt.toISOString(),
    status: booking.status,
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BookingClient data={data} />
      </div>
    </div>
  );
};

export default BookingsPage;
