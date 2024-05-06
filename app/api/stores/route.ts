

import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import prismadb from "@/lib/prismadb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Ensure user is authenticated
    const { userId } = getAuth(req);

    // Parse request body
    const { name } = req.body;

    // Validate request body
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Create a new store
    const store = await prismadb.store.create({
      data: {
        name,
        userId,
      },
    });

    // Return the created store
    return res.status(201).json(store);
  } catch (error) {
    console.error("[STORES_POST]", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
