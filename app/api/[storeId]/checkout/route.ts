import { NextResponse, NextRequest } from "next/server";
import { razorpay } from "@/lib/razorpay";
import prismadb from "@/lib/prismadb";
import { getCorsHeaders } from "@/lib/api-utils";

type Params<T> = { params: Promise<T> };

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function POST(
  req: NextRequest,
  { params }: Params<{ storeId: string }>
) {
  const origin = req.headers.get("origin");

  try {
    const { storeId } = await params; // ✅ FIX HERE

    const { productIds, phone, address, name, email, age, location } =
      await req.json();

    if (!storeId || typeof storeId !== "string") {
      return new NextResponse("Invalid storeId", {
        status: 400,
        headers: getCorsHeaders(origin),
      });
    }

    if (!productIds || productIds.length === 0) {
      return new NextResponse("Product Ids are required", {
        status: 400,
        headers: getCorsHeaders(origin),
      });
    }

    if (!phone || typeof phone !== "string" || phone.trim() === "") {
      return new NextResponse("Phone number is required", {
        status: 400,
        headers: getCorsHeaders(origin),
      });
    }

    if (!address || typeof address !== "string" || address.trim() === "") {
      return new NextResponse("Address is required", {
        status: 400,
        headers: getCorsHeaders(origin),
      });
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      return new NextResponse("Name is required", {
        status: 400,
        headers: getCorsHeaders(origin),
      });
    }

    if (!email || typeof email !== "string" || email.trim() === "") {
      return new NextResponse("Email is required", {
        status: 400,
        headers: getCorsHeaders(origin),
      });
    }

    if (!age || typeof age !== "number") {
      return new NextResponse("Age is required", {
        status: 400,
        headers: getCorsHeaders(origin),
      });
    }

    if (!location || typeof location !== "string" || location.trim() === "") {
      return new NextResponse("Location is required", {
        status: 400,
        headers: getCorsHeaders(origin),
      });
    }

    const products = await prismadb.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    const conversionRate = process.env.USD_TO_INR_RATE
      ? parseFloat(process.env.USD_TO_INR_RATE)
      : 83;

    const totalAmount = products.reduce(
      (total: number, product: { price: number }) => {
        return total + Math.round(product.price * conversionRate);
      },
      0
    );

    const finalAmount = Math.min(Math.max(totalAmount, 100), 50000000);

    const razorpayOrder = await razorpay.orders.create({
      amount: finalAmount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: true,
      notes: { storeId },
    });

    const savedorder = await prismadb.order.create({
      data: {
        id: razorpayOrder.id,
        storeId,
        isPaid: false,
        phone,
        address,
        name,
        email,
        age,
        location,
        orderItems: {
          create: productIds.map((productId: string) => ({
            product: {
              connect: { id: productId },
            },
          })),
        },
      },
    });

    return NextResponse.json(
      {
        orderId: razorpayOrder.id,
        amount: finalAmount,
        currency: "INR",
        key: process.env.RAZORPAY_KEY_ID,
        order: savedorder,
      },
      { headers: getCorsHeaders(origin) }
    );
  } catch (error) {
    console.log("[CHECKOUT_ERROR]", error);

    return new NextResponse("Internal error", {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }
}