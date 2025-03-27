// app/api/stores/[storeId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import axios from "axios";

const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

// Function to add a domain to Vercel project
async function addDomainToProject(projectId: string, domainName: string) {
    if (!VERCEL_ACCESS_TOKEN) {
        throw new Error("VERCEL_ACCESS_TOKEN is not set in the environment variables.");
    }

    try {
        const response = await axios.post(
            `${VERCEL_API_URL}/v9/projects/${projectId}/domains`,
            { name: domainName },
            {
                headers: {
                    Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                },
            }
        );
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                `Failed to add domain: ${error.response?.data?.error?.message || error.message}`
            );
        }
        throw error;
    }
}

// Function to remove a domain from Vercel project
async function removeDomainFromProject(projectId: string, domainName: string) {
    if (!VERCEL_ACCESS_TOKEN) {
        throw new Error("VERCEL_ACCESS_TOKEN is not set in the environment variables.");
    }

    try {
        const response = await axios.delete(
            `${VERCEL_API_URL}/v9/projects/${projectId}/domains/${domainName}`,
            {
                headers: {
                    Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                },
            }
        );
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                `Failed to remove domain: ${error.response?.data?.error?.message || error.message}`
            );
        }
        throw error;
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { storeId: string } }) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const body = await req.json();
        const { name, storeUrl } = body;

        if (!name && !storeUrl) {
            return new NextResponse("Name or storeUrl is required", { status: 400 });
        }

        const store = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            },
        });

        if (!store) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        let updatedData: { name?: string; storeUrl?: string } = {};

        if (name) {
            updatedData.name = name;
        }

        if (storeUrl) {
            // Validate storeUrl format (basic check)
            try {
                new URL(storeUrl);
            } catch (error) {
                return new NextResponse("Invalid storeUrl format", { status: 400 });
            }

            updatedData.storeUrl = storeUrl;

            // Update Vercel project domain if storeUrl changes
            if (VERCEL_PROJECT_ID && store.storeUrl && store.storeUrl !== storeUrl) {
                try {
                    // Remove the old domain
                    await removeDomainFromProject(VERCEL_PROJECT_ID, store.storeUrl);
                    // Add the new domain
                    await addDomainToProject(VERCEL_PROJECT_ID, storeUrl);
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        return new NextResponse(`Failed to update Vercel domain: ${error.message}`, {
                            status: 500,
                        });
                    }
                    return new NextResponse("Failed to update Vercel domain", { status: 500 });
                }
            }
        }

        const updatedStore = await prismadb.store.update({
            where: {
                id: params.storeId,
            },
            data: updatedData,
        });

        return NextResponse.json(updatedStore);
    } catch (error) {
        console.error("[STORE_PATCH]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const store = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            },
        });

        if (!store) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        // Remove the domain from Vercel before deleting the store
        if (VERCEL_PROJECT_ID && store.storeUrl) {
            try {
                await removeDomainFromProject(VERCEL_PROJECT_ID, store.storeUrl);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.log(`[STORE_DELETE] Failed to remove Vercel domain: ${error.message}`);
                }
            }
        }

        const deletedStore = await prismadb.store.delete({
            where: {
                id: params.storeId,
            },
        });

        return NextResponse.json(deletedStore);
    } catch (error) {
        console.error("[STORE_DELETE]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { storeId: string } }
) {
    try {
        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const store = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
            },
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