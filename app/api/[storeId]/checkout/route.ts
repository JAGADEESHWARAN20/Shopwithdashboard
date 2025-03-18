import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
     "Access-Control-Allow-Origin": "https://ecommercestore-online.vercel.app/",
     "Access-Control-Allow-Methods": "POST,GET,PUT,DELETE,OPTIONS",
     "Access-Control-Allow-Headers": "Content-Type, Authorization",
     "Access-Control-Allow-Credentials": "true"
};

export async function OPTIONS() {
     return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
     if (req.method === 'OPTIONS') {
          return NextResponse.json({}, { headers: corsHeaders });
     }
     try {
          const { productIds, phone, address, name, email, age, location } = await req.json(); // Include age and location

          if (!params.storeId || typeof params.storeId !== 'string') {
               return new NextResponse("Invalid storeId", { status: 400, headers: corsHeaders });
          }

          if (!productIds || productIds.length === 0) {
               return new NextResponse("Product Ids are required", { status: 400, headers: corsHeaders });
          }

          if (!phone || typeof phone !== 'string' || phone.trim() === '') {
               return new NextResponse("Phone number is required", { status: 400, headers: corsHeaders });
          }

          if (!address || typeof address !== 'string' || address.trim() === '') {
               return new NextResponse("Address is required", { status: 400, headers: corsHeaders });
          }
          if (!name || typeof name !== 'string' || name.trim() === '') {
               return new NextResponse("Name is required", { status: 400, headers: corsHeaders });
          }
          if (!email || typeof email !== 'string' || email.trim() === '') {
               return new NextResponse("Email is required", { status: 400, headers: corsHeaders });
          }
          if (!age || typeof age !== 'number') {
               return new NextResponse("Age is required", { status: 400, headers: corsHeaders });
          }
          if (!location || typeof location !== 'string' || location.trim() === '') {
               return new NextResponse("Location is required", { status: 400, headers: corsHeaders });
          }

          const products = await prismadb.product.findMany({
               where: {
                    id: {
                         in: productIds
                    }
               }
          });

          const conversionRate = process.env.USD_TO_INR_RATE ? parseFloat(process.env.USD_TO_INR_RATE) : 83;

          const totalAmount = products.reduce((total, product) => {
               const inrAmount = Math.round(product.price * conversionRate);
               return total + inrAmount;
          }, 0);

          const finalAmount = Math.min(Math.max(totalAmount * 83, 100), 50000000);

          const razorpayOrder = await razorpay.orders.create({
               amount: finalAmount,
               currency: "INR",
               receipt: `receipt_${Date.now()}`,
               payment_capture: true,
               notes: {
                    storeId: params.storeId
               }
          });

          const savedorder = await prismadb.order.create({
               data: {
                    id: razorpayOrder.id,
                    storeId: params.storeId,
                    isPaid: false,
                    phone: phone,
                    address: address,
                    name: name,
                    email: email,
                    age: age, // Add age
                    location: location, // Add location
                    orderItems: {
                         create: productIds.map((productId: string) => ({
                              product: {
                                   connect: {
                                        id: productId,
                                   },
                              },
                         })),
                    },
               },
          });

          return NextResponse.json({
               orderId: razorpayOrder.id,
               amount: finalAmount,
               currency: "INR",
               key: process.env.RAZORPAY_KEY_ID,
               order: savedorder
          }, { headers: corsHeaders });

     } catch (error) {
          console.log('[CHECKOUT_ERROR]', error);
          return new NextResponse("Internal error", {
               status: 500,
               headers: corsHeaders
          });
     }
}