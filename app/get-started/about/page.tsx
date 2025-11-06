import { Suspense } from "react";
import AboutClient from "./AboutClient";
import Loader from "@/components/ui/loader";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div><Loader /></div>}>
      <AboutClient />
    </Suspense>
  );
}
