import { auth, currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { corsResponse, errorResponse, getCorsHeaders } from "@/lib/api-utils";

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req.headers.get("origin")),
  });
}

export async function GET(req: Request) {
  const origin = req.headers.get("origin");

  try {
    const { userId: clerkId } = await auth();
    const clerkUser = await currentUser();

    if (!clerkId || !clerkUser) {
      return errorResponse("Unauthorized", origin, 401);
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

    let user = await prismadb.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      user = await prismadb.user.create({
        data: {
          clerkId,
          email,
          name: clerkUser.fullName ?? "",
          image: clerkUser.imageUrl ?? "",
        },
      });
    }

    return corsResponse(user, origin);
  } catch (error) {
    console.error("[ME_GET_ERROR]", error);
    return errorResponse("Internal error", origin);
  }
}