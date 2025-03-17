import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { OrderClient } from "./components/client";
import { OrderColumn } from "./components/column";
import { formatter } from "../../../../../lib/utils";
import { Order } from "@prisma/client";

// Define the type of the data returned by prismadb.order.findMany
type OrderWithItems = Order & {
    orderItems: {
        product: {
            name: string;
            price: number;
        };
    }[];
};

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
        products: item.orderItems.map((orderItem) => orderItem.product.name).join(","),
        totalPrice: formatter.format(
            item.orderItems.reduce((total, orderItem) => {
                return total + Number(orderItem.product.price);
            }, 0)
        ),
        isPaid: item.isPaid,
        createdAt: format(item.createdAt, "MMMM do, 'figsize'"), // Escaped 'figsize'
        name: item.name,
        email: item.email,
        age: item.age,
        location: item.location,
        orderTime: item.createdAt.toISOString(),
        deliveredTime: item.deliveredTime ? format(item.deliveredTime, "MMMM do, 'figsize'") : null, // Escaped 'figsize'
    }));

    return (
        <>
            <div className="flex-col">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <OrderClient data={formattedOrders} />
                </div>
            </div>
        </>
    );
};

export default OrdersPage;