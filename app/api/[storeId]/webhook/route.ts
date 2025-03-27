// // import { headers } from "next/headers";
// // import { NextResponse } from "next/server";
// // import crypto from "crypto";
// // import prismadb from "@/lib/prismadb";

// // export async function POST(req: Request) {
// //      try {
// //           const body = await req.text();
// //           const headersList = headers();
// //           const razorpay_signature = headersList.get("x-razorpay-signature");
// //           console.log('Webhook received:', {
// //                signature: razorpay_signature,
// //                body: JSON.parse(body)
// //           });
// //           const expectedSignature = crypto
// //                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
// //                .update(body)
// //                .digest("hex");

// //           if (razorpay_signature === expectedSignature) {
// //                const payment = JSON.parse(body);
// //                console.log('Payment event:', payment.event);
// //                switch (payment.event) {
// //                     case "payment.captured":
// //                     case "order.paid":
// //                          console.log('Updating order:', payment.payload.payment.entity.receipt);
// //                          const order = await prismadb.order.update({
// //                               where: {
// //                                    id: payment.payload.payment.entity.receipt
// //                               },
// //                               data: {
// //                                    isPaid: true
// //                               }
// //                          });
// //                          console.log('Order updated:', order);
// //                          break;
// //                }

// //                return new NextResponse(null, { status: 200 });
// //           }
// //           console.log('Invalid signature');
// //           return new NextResponse("Invalid signature", { status: 400 });
// //      } catch (error) {
// //           console.log('[WEBHOOK_ERROR]', error);
// //           return new NextResponse("Webhook error", { status: 500 });
// //      }
// // }
// import { headers } from "next/headers";
// import { NextResponse } from "next/server";
// import crypto from "crypto";
// import prismadb from "@/lib/prismadb";

// export async function POST(req: Request) {
//     try {
//         const body = await req.text();
//         const headersList = headers();
//         const razorpay_signature = headersList.get("x-razorpay-signature");

//         const payloadData = JSON.parse(body);
//         console.log('Full webhook payload:', payloadData);

//         const expectedSignature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
//             .update(body)
//             .digest("hex");

//         console.log('Signature comparison:', {
//             received: razorpay_signature,
//             expected: expectedSignature,
//             matches: razorpay_signature === expectedSignature
//         });

//         if (razorpay_signature === expectedSignature) {
//             const payment = payloadData;
//             console.log('Processing payment event:', payment.event);

//             switch (payment.event) {
//                 case "payment.captured":
//                 case "order.paid":
//                     console.log('Payment entity:', payment.payload.payment.entity);
//                     const orderId = payment.payload.payment.entity.receipt;
//                     console.log('Attempting to update order:', orderId);

//                     try {
//                         const order = await prismadb.order.update({
//                             where: {
//                                 id: orderId
//                             },
//                             data: {
//                                 isPaid: true
//                             }
//                         });
//                         console.log('Order successfully updated:', order);
//                     } catch (dbError) {
//                         console.error('Database update failed:', dbError);
//                         return new NextResponse("Database update failed", { status: 500 });
//                     }
//                     break;

//                 default:
//                     console.log('Unhandled event type:', payment.event);
//             }

//             return new NextResponse(null, { status: 200 });
//         }

//         console.log('Invalid signature');
//         return new NextResponse("Invalid signature", { status: 400 });
//     } catch (error) {
//         console.error('[WEBHOOK_ERROR]', error);
//         return new NextResponse("Webhook error", { status: 500 });
//     }
// }

// pages/api/webhook/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const headersList = headers();
        const razorpaySignature = headersList.get("x-razorpay-signature");

        const payloadData = JSON.parse(body);
        console.log("Full webhook payload:", payloadData);

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(body)
            .digest("hex");

        console.log("Signature comparison:", {
            received: razorpaySignature,
            expected: expectedSignature,
            matches: razorpaySignature === expectedSignature,
        });

        if (razorpaySignature === expectedSignature) {
            const payment = payloadData;
            console.log("Processing payment event:", payment.event);

            switch (payment.event) {
                case "payment.captured":
                case "order.paid":
                    console.log("Payment entity:", payment.payload.payment.entity);
                    const orderId = payment.payload.payment.entity.order_id; // corrected to order_id
                    console.log("Attempting to update order:", orderId);

                    try {
                        const order = await prismadb.order.update({
                            where: {
                                id: orderId,
                            },
                            data: {
                                isPaid: true,
                            },
                        });
                        console.log("Order successfully updated:", order);
                    } catch (dbError) {
                        console.error("Database update failed:", dbError);
                        return new NextResponse("Database update failed", { status: 500 });
                    }
                    break;

                default:
                    console.log("Unhandled event type:", payment.event);
            }

            return new NextResponse(null, { status: 200 });
        }

        console.log("Invalid signature");
        return new NextResponse("Invalid signature", { status: 400 });
    } catch (error) {
        console.error("[WEBHOOK_ERROR]", error);
        return new NextResponse("Webhook error", { status: 500 });
    }
}