import { Suspense } from "react";
import PaymentClient from "./PaymentClient";
import Loader from "@/components/ui/loader";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div><Loader /></div>}>
      <PaymentClient />
    </Suspense>
  );
}
