import { Suspense } from "react";
import QuestionClient from "./QuestionClient";
import Loader from "@/components/ui/loader";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div><Loader /></div>}>
      <QuestionClient />
    </Suspense>
  );
}
