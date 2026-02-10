import { handlers } from "@/lib/auth";

// Disable static optimization for this route
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;
