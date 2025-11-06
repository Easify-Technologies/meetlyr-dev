import { Suspense } from "react";
import LocationClient from "./LocationClient";
import Loader from "@/components/ui/loader";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div><Loader /></div>}>
      <LocationClient />
    </Suspense>
  );
}
