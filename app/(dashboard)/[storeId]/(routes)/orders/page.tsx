import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { OrderClient } from "./components/client";
import { OrderColumn } from "./components/column";
import { formatter } from "../../../../../lib/utils";

type OrderWithItems = Awaited<
    ReturnType<typeof prismadb.order.findMany>
>[number];

const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
    const orders = await prismadb.order.findMany({
        where: {
            storeId: params.storeId,
        },
        include: {
            orderItems: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const formattedOrders: OrderColumn[] = (orders as OrderWithItems[]).map((item) => ({
        id: item.id,
        phone: item.phone,
        address: item.address,
        products: item.orderItems.map((orderItem: { product: { name: string } }) => orderItem.product.name).join(","),
        totalPrice: formatter.format(
            item.orderItems.reduce(
                (total: number, orderItem: { product: { price: number } }) => {
                    return total + Number(orderItem.product.price);
                },
                0
            )
        ),
        isPaid: item.isPaid,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
        name: item.name,
        email: item.email,
        age: item.age,
        location: item.location,
        orderTime: item.createdAt.toISOString(),
        deliveredTime: item.deliveredTime ? format(item.deliveredTime, "MMMM do, yyyy") : null,
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <OrderClient data={formattedOrders} />
            </div>
        </div>
    );
};

export default OrdersPage;
