import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import axios from "axios";
import validator from "validator";
import { broadcast } from "@/lib/websocket"; // Hypothetical WebSocket broadcast function

const VERCEL_API_URL = "https://api.vercel.com";
const VERCEL_ACCESS_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

async function addDomainToProject(domainName: string) {
    if (!VERCEL_ACCESS_TOKEN) {
        throw new Error("VERCEL_ACCESS_TOKEN is not set in the environment variables.");
    }

    try {
        const domainCheckResponse = await axios.get(
            `${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains?domain=${domainName}`,
            {
                headers: {
                    Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                },
            }
        );

        const domainExists = domainCheckResponse.data.domains.some(
            (d: any) => d.name === domainName
        );

        if (domainExists) {
            console.log(`[STORE_PATCH] Domain ${domainName} already exists in Vercel project.`);
            return domainCheckResponse.data;
        }

        const domainAddResponse = await axios.post(
            `${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains`,
            { name: domainName },
            {
                headers: {
                    Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log(`[STORE_PATCH] Domain ${domainName} added to Vercel project.`);
        return domainAddResponse.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const errorCode = error.response?.data?.error?.code;
            let errorMessage = `Failed to add domain: ${error.message}`;
            if (errorCode) {
                errorMessage += ` (Error code: ${errorCode})`;
            }
            if (error.response?.status === 429) {
                throw new Error("Rate limit exceeded. Please try again later.");
            }
            console.error(`[STORE_PATCH] Vercel API error: ${errorMessage}`);
            throw new Error(errorMessage);
        }
        console.error(`[STORE_PATCH] Unexpected error: ${error}`);
        throw error;
    }
}

async function removeDomainFromProject(domainName: string) {
    if (!VERCEL_ACCESS_TOKEN) {
        throw new Error("VERCEL_ACCESS_TOKEN is not set in the environment variables.");
    }

    try {
        const response = await axios.delete(
            `${VERCEL_API_URL}/v9/projects/${VERCEL_PROJECT_ID}/domains/${domainName}`,
            {
                headers: {
                    Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                },
            }
        );
        console.log(`[STORE_PATCH] Domain ${domainName} removed from Vercel project.`);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const errorCode = error.response?.data?.error?.code;
            let errorMessage = `Failed to remove domain: ${error.message}`;
            if (errorCode) {
                errorMessage += ` (Error code: ${errorCode})`;
            }
            if (error.response?.status === 429) {
                throw new Error("Rate limit exceeded. Please try again later.");
            }
            console.error(`[STORE_PATCH] Vercel API error: ${errorMessage}`);
            throw new Error(errorMessage);
        }
        console.error(`[STORE_PATCH] Unexpected error: ${error}`);
        throw error;
    }
}

async function patchDomain(domainName: string, customNameservers: string[]) {
    if (!VERCEL_ACCESS_TOKEN) {
        throw new Error("VERCEL_ACCESS_TOKEN is not set in the environment variables.");
    }
    try {
        const response = await axios.patch(
            `${VERCEL_API_URL}/v3/domains/${domainName}`,
            {
                op: 'update',
                customNameservers: customNameservers,
            },
            {
                headers: {
                    Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log(`[STORE_PATCH] Domain ${domainName} patched with customNameservers.`);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const errorCode = error.response?.data?.error?.code;
            let errorMessage = `Failed to patch domain: ${error.message}`;
            if (errorCode) {
                errorMessage += ` (Error code: ${errorCode})`;
            }
            if (error.response?.status === 429) {
                throw new Error("Rate limit exceeded. Please try again later.");
            }
            console.error(`[STORE_PATCH] Vercel API error: ${errorMessage}`);
            throw new Error(errorMessage);
        }
        console.error(`[STORE_PATCH] Unexpected error: ${error}`);
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
        const { name, storeUrl, customNameservers } = body;

        if (!name && !storeUrl && !customNameservers) {
            return new NextResponse("Name, storeUrl or customNameservers is required", { status: 400 });
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

        if (storeUrl !== undefined) {
            if (storeUrl && !validator.isURL(storeUrl, { require_tld: false })) {
                return new NextResponse("Invalid storeUrl format", { status: 400 });
            }

            if (storeUrl && !storeUrl.endsWith("ecommercestore-online.vercel.app")) {
                return new NextResponse("Store URL must end with ecommercestore-online.vercel.app", { status: 400 });
            }

            const domainName = storeUrl ? storeUrl.replace(/^https?:\/\//, '').split('/')[0] : "";

            const updatedStore = await prismadb.$transaction(async (prisma) => {
                if (store.storeUrl && store.storeUrl !== storeUrl) {
                    try {
                        if (store.storeUrl) {
                            const oldDomain = store.storeUrl.replace(/^https?:\/\//, '').split('/')[0];
                            await removeDomainFromProject(oldDomain);
                        }
                        if (storeUrl) {
                            await addDomainToProject(domainName);
                        }
                    } catch (error: any) {
                        throw new Error(`Failed to update Vercel domain: ${error.message}`);
                    }
                } else if (!store.storeUrl && storeUrl) {
                    await addDomainToProject(domainName);
                }

                updatedData.storeUrl = storeUrl || "";

                const updated = await prisma.store.update({
                    where: {
                        id: params.storeId,
                    },
                    data: updatedData,
                });

                await broadcast({
                    type: "storeUpdate",
                    data: {
                        storeId: params.storeId,
                        storeUrl: updated.storeUrl,
                        name: updated.name,
                        alternateUrls: updated.alternateUrls,
                    },
                });

                return updated;
            });

            return NextResponse.json(updatedStore);
        }

        if (customNameservers) {
            const domainName = store.storeUrl ? store.storeUrl.replace(/^https?:\/\//, '').split('/')[0] : "";
            await patchDomain(domainName, customNameservers);
        }

        const updatedStore = await prismadb.store.update({
            where: {
                id: params.storeId,
            },
            data: updatedData,
        });

        await broadcast({
            type: "storeUpdate",
            data: {
                storeId: params.storeId,
                storeUrl: updatedStore.storeUrl,
                name: updatedStore.name,
                alternateUrls: updatedStore.alternateUrls,
            },
        });

        return NextResponse.json(updatedStore);
    } catch (error: any) {
        console.error("[STORE_PATCH]", error);
        if (error.message.includes("Rate limit exceeded")) {
            return new NextResponse("Rate limit exceeded. Please try again later.", { status: 429 });
        }
        return new NextResponse(`Internal error: ${error.message}`, { status: 500 });
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