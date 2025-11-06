import { Suspense } from "react";
import MatchingClient from "./MatchingClient";
import Loader from "@/components/ui/loader";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div><Loader /></div>}>
      <MatchingClient />
    </Suspense>
  );
}
