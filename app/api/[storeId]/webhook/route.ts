import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
    try {
        const { storeId } = params;

        // Validate storeId
        if (!storeId) {
            console.error("[WEBHOOK_ERROR] Store ID is required");
            return new NextResponse("Store ID is required", { status: 400 });
        }

        // Verify the store exists
        const store = await prismadb.store.findUnique({
            where: { id: storeId },
        });

        if (!store) {
            console.error(`[WEBHOOK_ERROR] Store not found for storeId: ${storeId}`);
            return new NextResponse("Store not found", { status: 404 });
        }

        // Get the raw body and headers for signature verification
        const body = await req.text();
        const headersList = headers();
        const razorpaySignature = headersList.get("x-razorpay-signature");

        if (!razorpaySignature) {
            console.error("[WEBHOOK_ERROR] Missing Razorpay signature");
            return new NextResponse("Missing Razorpay signature", { status: 400 });
        }

        // Verify the webhook signature
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(body)
            .digest("hex");

        console.log("Signature comparison:", {
            received: razorpaySignature,
            expected: expectedSignature,
            matches: razorpaySignature === expectedSignature,
        });

        if (razorpaySignature !== expectedSignature) {
            console.error("[WEBHOOK_ERROR] Invalid signature");
            return new NextResponse("Invalid signature", { status: 400 });
        }

        // Parse the webhook payload
        const payloadData = JSON.parse(body);
        console.log(`[WEBHOOK] Full webhook payload for store ${storeId}:`, payloadData);

        // Process the payment event
        const payment = payloadData;
        console.log(`[WEBHOOK] Processing payment event for store ${storeId}:`, payment.event);

        switch (payment.event) {
            case "payment.captured":
            case "order.paid":
                console.log("Payment entity:", payment.payload.payment.entity);
                const orderId = payment.payload.payment.entity.order_id; // Corrected to order_id
                console.log(`Attempting to update order for store ${storeId}:`, orderId);

                try {
                    // Verify the order belongs to this store (optional, depending on your schema)
                    const order = await prismadb.order.findFirst({
                        where: {
                            id: orderId,
                            storeId: storeId, // Ensure the order belongs to this store
                        },
                    });

                    if (!order) {
                        console.error(`[WEBHOOK_ERROR] Order ${orderId} not found for store ${storeId}`);
                        return new NextResponse("Order not found", { status: 404 });
                    }

                    // Update the order
                    const updatedOrder = await prismadb.order.update({
                        where: {
                            id: orderId,
                        },
                        data: {
                            isPaid: true,
                        },
                    });
                    console.log(`[WEBHOOK] Order successfully updated for store ${storeId}:`, updatedOrder);
                } catch (dbError) {
                    console.error(`[WEBHOOK_ERROR] Database update failed for store ${storeId}:`, dbError);
                    return new NextResponse("Database update failed", { status: 500 });
                }
                break;

            default:
                console.log(`[WEBHOOK] Unhandled event type for store ${storeId}:`, payment.event);
        }

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error(`[WEBHOOK_ERROR] Error processing webhook for store ${params?.storeId || "unknown"}:`, error);
        return new NextResponse("Webhook error", { status: 500 });
    }
}