import Header from "@/components/layout/header";
import { PricingTable } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      {/* Render Header at the top */}
      <Header />

      <h1 className="text-3xl font-bold my-6">Hello Nextjs</h1>

      <PricingTable />
    </div>
  );
}


