import Footer from "@/components/Footer";
import Status from "@/components/Status";
import { Skeleton } from "@/components/ui/skeleton";
import React, { Suspense } from "react";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

function StatusPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <header className="p-16 flex justify-center">
          <div className="flex flex-col justify-center max-w-xl text-center gap-1">
            <h1 className="text-4xl font-bold">Infinite Craft Solver</h1>
          </div>
        </header>

        <Suspense
          fallback={
            <div className="flex justify-center">
              <Skeleton className="w-[500px] h-[300px] animate-pulse" />
            </div>
          }
        >
          <Status />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

export default StatusPage;
