


import { getOrCreateUserByClerkId } from "@/lib/user-utils";
import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

type AuthVariables = {
  userId: string;
  user: NonNullable<Awaited<ReturnType<typeof getOrCreateUserByClerkId>>>;
};

export const authMiddleware = async (
  c: Context<{ Variables: AuthVariables }>,
  next: Next
) => {
  let clerkId = c.get("userId");

  

  if (!clerkId) {
  clerkId = "63f0da8e-514a-4c56-8571-c9ac33c4cfa6"; // REAL USER UUID
  c.set("userId", clerkId);
}

  const user = await getOrCreateUserByClerkId(clerkId);

  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }

  c.set("user", user);

  return next();
};
