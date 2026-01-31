// import { auth } from "@clerk/nextjs/server";
// import Header from "./header";

// export default async function HeaderWrapper() {
//   const { has } = await auth();
//   const isPro = has({ plan: "pro_plan" });

//   return <Header isPro={isPro} />;
// }
import { auth } from "@clerk/nextjs/server";
import Header from "./header";

export default async function HeaderWrapper() {
  let isPro = false;

  try {
    const { has } = await auth();
    isPro = has?.({ plan: "pro_plan" }) ?? false;
  } catch (err) {
    // DEV / unauthenticated fallback
    isPro = false;
  }

  return <Header isPro={isPro} />;
}
