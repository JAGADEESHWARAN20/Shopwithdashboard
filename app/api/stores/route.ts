import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import axios from "axios";

const RAZORPAY_API_URL = "https://api.razorpay.com/v1";
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID as string;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET as string;

// Validate environment variables at startup
if (!RAZORPAY_KEY_ID) {
  throw new Error("RAZORPAY_KEY_ID is not defined in environment variables");
}
if (!RAZORPAY_KEY_SECRET) {
  throw new Error("RAZORPAY_KEY_SECRET is not defined in environment variables");
}

// Helper function to create Razorpay webhook
async function createRazorpayWebhook(storeId: string) {
  const webhookUrl = `https://admindashboardecom.vercel.app/api/${storeId}/webhook`;
  try {
    const response = await axios.post(
      `${RAZORPAY_API_URL}/webhooks`,
      {
        url: webhookUrl,
        events: {
          "payment.authorized": true,
          "payment.captured": true,
          "payment.failed": true,
        },
        alert_email: "jagadeeshwaransp5@gmail.com",
        secret: "qn3WYkSwJgZpyhxKK4YK3wAy",
      },
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET,
        },
      }
    );
    console.log(`[RAZORPAY_WEBHOOK] Created webhook for store ${storeId}: ${webhookUrl}`);
    return response.data.id;
  } catch (error: any) {
    console.error("[RAZORPAY_WEBHOOK] Failed to create webhook:", error.response?.data || error.message);
    throw error;
  }
}

// POST route (for creating a new store)
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const storeUrl = `https://${name.toLowerCase().replace(/\s+/g, '-')}-ecommercestore-online.vercel.app`;

    const store = await prismadb.store.create({
      data: {
        name,
        userId,
        isActive: true,
        storeUrl,
      },
    });

    // Create Razorpay webhook for this store
    let razorpayWebhookId: string | null = null;
    try {
      const id = await createRazorpayWebhook(store.id);
      razorpayWebhookId = id;
    } catch (error: any) {
      console.error("[RAZORPAY_WEBHOOK] Failed to create webhook:", error.response?.data || error.message);
      // Roll back the store creation if webhook creation fails
      await prismadb.store.delete({ where: { id: store.id } });
      return new NextResponse("Failed to create Razorpay webhook", { status: 500 });
    }

    // Update the store with the Razorpay webhook ID
    if (razorpayWebhookId) {
      await prismadb.store.update({
        where: { id: store.id },
        data: {
          razorpayWebhookId: razorpayWebhookId,
        },
      });
    }

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error("[STORES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// GET route (for fetching stores for the current user)
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const stores = await prismadb.store.findMany({
      where: {
        userId,
      },
    });

    return NextResponse.json(stores, { status: 200 });
  } catch (error) {
    console.error("[STORES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}