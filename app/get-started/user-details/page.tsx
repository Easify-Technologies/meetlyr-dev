import { Suspense } from "react";
import UserDetailClient from "./UserDetailClient";
import Loader from "@/components/ui/loader";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div><Loader /></div>}>
      <UserDetailClient />
    </Suspense>
  );
}
