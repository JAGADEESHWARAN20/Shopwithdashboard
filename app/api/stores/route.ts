import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import axios from "axios";
import validator from "validator";

type Params<T> = { params: Promise<T> };

const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

// ================= ADD DOMAIN =================
async function addDomainToProject(projectId: string, domainName: string) {
  if (!VERCEL_ACCESS_TOKEN) {
    throw new Error("VERCEL_ACCESS_TOKEN is not set.");
  }

  const res = await axios.post(
    `${VERCEL_API_URL}/v9/projects/${projectId}/domains`,
    { name: domainName },
    {
      headers: {
        Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
}

// ================= REMOVE DOMAIN =================
async function removeDomainFromProject(projectId: string, domainName: string) {
  if (!VERCEL_ACCESS_TOKEN) {
    throw new Error("VERCEL_ACCESS_TOKEN is not set.");
  }

  await axios.delete(
    `${VERCEL_API_URL}/v9/projects/${projectId}/domains/${domainName}`,
    {
      headers: {
        Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
      },
    }
  );
}

// ================= GET STORE =================
export async function GET(
  req: NextRequest,
  { params }: Params<{ storeId: string }>
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const store = await prismadb.store.findFirst({
      where: { id: params.storeId },
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error("[STORE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// ================= CREATE STORE =================
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const { name, storeUrl } = await req.json();

    if (!name) {
      return new NextResponse("Store name is required", { status: 400 });
    }

    let finalStoreUrl: string | null = null;

    if (storeUrl) {
      if (!validator.isURL(storeUrl, { require_tld: false })) {
        return new NextResponse("Invalid URL", { status: 400 });
      }

      const domain = storeUrl.replace(/^https?:\/\//, "").split("/")[0];

      if (VERCEL_PROJECT_ID) {
        await addDomainToProject(VERCEL_PROJECT_ID, domain);
      }

      finalStoreUrl = storeUrl;
    }

    const store = await prismadb.store.create({
      data: {
        name,
        userId,
        storeUrl: finalStoreUrl,
      },
    });

    return NextResponse.json(store);
  } catch (error: any) {
    console.error("[STORE_POST]", error);
    return new NextResponse(error.message, { status: 500 });
  }
}

// ================= UPDATE STORE =================
export async function PATCH(
  req: NextRequest,
  { params }: Params<{ storeId: string }>
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const { name, storeUrl } = await req.json();

    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    let data: any = {};

    if (name) data.name = name;

    if (storeUrl) {
      if (!validator.isURL(storeUrl, { require_tld: false })) {
        return new NextResponse("Invalid URL", { status: 400 });
      }

      const domain = storeUrl.replace(/^https?:\/\//, "").split("/")[0];

      if (store.storeUrl && store.storeUrl !== storeUrl) {
        const oldDomain = store.storeUrl.replace(/^https?:\/\//, "").split("/")[0];
        if (VERCEL_PROJECT_ID) {
          await removeDomainFromProject(VERCEL_PROJECT_ID, oldDomain);
        }
      }

      if (VERCEL_PROJECT_ID) {
        await addDomainToProject(VERCEL_PROJECT_ID, domain);
      }

      data.storeUrl = storeUrl;
    }

    const updated = await prismadb.store.update({
      where: { id: params.storeId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[STORE_PATCH]", error);
    return new NextResponse(error.message, { status: 500 });
  }
}