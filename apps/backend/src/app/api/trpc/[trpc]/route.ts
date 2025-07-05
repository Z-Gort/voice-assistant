import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/server/api/root";
import { createContext } from "~/server/api/trpc";
import type { NextRequest } from "next/server";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };

//When CORS is needed check this: https://github.com/clerk/t3-turbo-and-clerk/blob/main/apps/nextjs/src/pages/api/trpc/%5Btrpc%5D.ts