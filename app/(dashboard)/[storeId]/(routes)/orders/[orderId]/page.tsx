import { format } from "date-fns";
import { notFound } from "next/navigation";
import prismadb from "@/lib/prismadb";
import MarkDeliveredButton from "./mark-delivered-button";

const OrderDetailPage = async ({ params }: { params: Promise<{ storeId: string; orderId: string }> }) => {
  const { storeId, orderId } = await params;
  const order = await prismadb.order.findFirst({
    where: { id: orderId, storeId },
    include: { user: true, orderItems: { include: { product: true } } },
  });
  if (!order) return notFound();

  return (
    <div className="p-8 space-y-4">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Order {order.id}</h1><MarkDeliveredButton orderId={order.id} delivered={Boolean(order.deliveredTime)} /></div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded border p-4 space-y-2 text-sm">
          <h2 className="font-semibold">Customer</h2>
          <p>Name: {order.name || order.user.name || "-"}</p><p>Email: {order.email || order.user.email}</p><p>Phone: {order.phone}</p><p>Address: {order.address}</p>
          <p>Status: {order.deliveredTime ? `Delivered on ${format(order.deliveredTime, "PPP p")}` : "Pending delivery"}</p>
        </div>
        <div className="rounded border p-4 space-y-2 text-sm"><h2 className="font-semibold">Products</h2>{order.orderItems.map((i)=><div key={i.id} className="flex justify-between"><span>{i.product.name}</span><span>₹{i.product.price}</span></div>)}</div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
