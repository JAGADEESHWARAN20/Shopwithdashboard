import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import prismadb from "@/lib/prismadb";

type Params<T> = { params: Promise<T> };

export async function POST(
  req: NextRequest,
  { params }: Params<{ storeId: string }>
) {
  let storeId: string | undefined;

  try {
    const resolved = await params; // ✅ FIX
    storeId = resolved.storeId;

    if (!storeId) {
      console.error("[WEBHOOK_ERROR] Store ID is required");
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const store = await prismadb.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      console.error(`[WEBHOOK_ERROR] Store not found for storeId: ${storeId}`);
      return new NextResponse("Store not found", { status: 404 });
    }

    const body = await req.text();
    const razorpaySignature = req.headers.get("x-razorpay-signature");

    if (!razorpaySignature) {
      console.error("[WEBHOOK_ERROR] Missing Razorpay signature");
      return new NextResponse("Missing Razorpay signature", { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (razorpaySignature !== expectedSignature) {
      console.error("[WEBHOOK_ERROR] Invalid signature");
      return new NextResponse("Invalid signature", { status: 400 });
    }

    const payloadData = JSON.parse(body);
    const payment = payloadData;

    switch (payment.event) {
      case "payment.captured":
      case "order.paid":
        const orderId = payment.payload.payment.entity.order_id;

        try {
          const order = await prismadb.order.findFirst({
            where: {
              id: orderId,
              storeId,
            },
          });

          if (!order) {
            console.error(`[WEBHOOK_ERROR] Order ${orderId} not found`);
            return new NextResponse("Order not found", { status: 404 });
          }

          await prismadb.order.update({
            where: { id: orderId },
            data: { isPaid: true },
          });

        } catch (dbError) {
          console.error("[WEBHOOK_ERROR] DB update failed:", dbError);
          return new NextResponse("Database update failed", { status: 500 });
        }

        break;

      default:
        console.log(`[WEBHOOK] Unhandled event: ${payment.event}`);
    }

    return new NextResponse(null, { status: 200 });

  } catch (error) {
    console.error(`[WEBHOOK_ERROR] Error for store ${storeId || "unknown"}:`, error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}
