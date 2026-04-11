import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import axios from "axios";

type Params<T> = { params: Promise<T> };

const STORE_BASE_DOMAIN = process.env.STORE_BASE_DOMAIN || "nwtailormadestudio.vercel.app";
const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

export async function GET(
     req: NextRequest,
     { params }: Params<{ storeId: string; subdomain: string }>
   ) {
     try {
       const { storeId, subdomain } = await params; // ✅ FIX
   
       if (!subdomain) {
         return new NextResponse("Subdomain is required", { status: 400 });
       }
   
       if (!storeId) {
         return new NextResponse("Store Id is required", { status: 400 });
       }
   
       const storeName = subdomain
         .replace(/-/g, " ")
         .trim()
         .replace(/\s+/g, " ");
   
   
       const store = await prismadb.store.findFirst({
         where: {
           name: {
             equals: storeName,
             mode: "insensitive",
           },
           isActive: true,
           id: storeId,
         },
       });
   
       if (!store) {
         return NextResponse.json(
           { domainStatus: false, storeUrl: null },
           { status: 404 }
         );
       }
   
       const correctUrl = `https://${subdomain}-${STORE_BASE_DOMAIN}`;
   
       if (store.storeUrl !== correctUrl) {
         await prismadb.store.update({
           where: { id: store.id },
           data: { storeUrl: correctUrl },
         });
   
         store.storeUrl = correctUrl;
       }
   
       let domainStatus = false;
   
       if (VERCEL_ACCESS_TOKEN && VERCEL_PROJECT_ID) {
         try {
           const domainStatusResponse = await axios.get(
             `${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains?domain=${correctUrl.replace("https://", "")}`,
             {
               headers: {
                 Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
               },
             }
           );
   
           const vercelDomains = domainStatusResponse.data.domains;
   
           domainStatus = vercelDomains.some(
             (d: any) => d.name === correctUrl.replace("https://", "")
           );
         } catch (err) {
           console.error("[STORE_VALIDATE] Vercel error:", err);
         }
       }
   
       return NextResponse.json({
         domainStatus,
         storeUrl: store.storeUrl,
       });
     } catch (error) {
       console.error("[STORE_VALIDATE]", error);
       return new NextResponse("Internal server error", { status: 500 });
     }
   }
