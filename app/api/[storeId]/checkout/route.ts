import { NextResponse, NextRequest } from "next/server";
import { razorpay } from "@/lib/razorpay";
import prismadb from "@/lib/prismadb";
import { getCorsHeaders } from "@/lib/api-utils";
import { auth } from "@clerk/nextjs/server";

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
    const { storeId } = await params;

    const { userId } = await auth(); // ✅ GET USER

    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: getCorsHeaders(origin),
      });
    }

    const user = await prismadb.user.findFirst({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse("User not found", {
        status: 404,
        headers: getCorsHeaders(origin),
      });
    }

    const { productIds, phone, address, name, email, age, location } =
      await req.json();

    // ================= VALIDATIONS =================

    if (!storeId) {
      return new NextResponse("Invalid storeId", { status: 400 });
    }

    if (!productIds?.length) {
      return new NextResponse("Product Ids are required", { status: 400 });
    }

    if (!phone?.trim()) {
      return new NextResponse("Phone number is required", { status: 400 });
    }

    if (!address?.trim()) {
      return new NextResponse("Address is required", { status: 400 });
    }

    if (!name?.trim()) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!email?.trim()) {
      return new NextResponse("Email is required", { status: 400 });
    }

    if (typeof age !== "number") {
      return new NextResponse("Age is required", { status: 400 });
    }

    if (!location?.trim()) {
      return new NextResponse("Location is required", { status: 400 });
    }

    // ================= PRODUCTS =================

    const products = await prismadb.product.findMany({
      where: { id: { in: productIds } },
    });

    const conversionRate = process.env.USD_TO_INR_RATE
      ? parseFloat(process.env.USD_TO_INR_RATE)
      : 83;

    const totalAmount = products.reduce((total, product) => {
      return total + Math.round(product.price * conversionRate);
    }, 0);

    const finalAmount = Math.min(Math.max(totalAmount, 100), 50000000);

    // ================= RAZORPAY =================

    const razorpayOrder = await razorpay.orders.create({
      amount: finalAmount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: true,
      notes: { storeId },
    });

    // ================= SAVE ORDER =================

    const savedorder = await prismadb.order.create({
      data: {
        id: razorpayOrder.id,
        storeId,
        userId: user.id, // ✅ FIX HERE
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

    return new NextResponse("Internal error", {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }
}