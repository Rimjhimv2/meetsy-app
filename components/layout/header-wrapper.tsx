import { auth } from "@clerk/nextjs/server";
import Header from "./header";

export default async function HeaderWrapper() {

  let isPro = false;

  try {
   const { has } = await auth();
    isPro = has?.({ plan: "pro_plan" }) ?? false;
  } catch {
    isPro = false;
  }

  return <Header isPro={isPro} />;
}
