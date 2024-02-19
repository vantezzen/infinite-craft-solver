"use client";
import Path from "@/components/Path";
import Finder from "@/lib/Finder";
import createResource from "@/lib/suspense";
import React, { useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

export interface Step {
  first: string;
  second: string;
  result: string;
}

function Results({ item }: { item: string }) {
  const [path, setPath] = React.useState<Step[] | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    const finder = new Finder();

    finder
      .findItem(item)
      .then((path) => {
        setPath(path);
      })
      .catch((error) => {
        setError(error);
      });
  }, [item]);

  if (error) {
    return (
      <div className="flex justify-center">
        <div className="text-center max-w-xl">
          <h2 className="font-bold text-lg">Error</h2>

          <div className="text-zinc-500 font-medium text-sm mt-3">
            {error.message}
          </div>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="flex justify-center">
        <Skeleton className="w-[500px] h-[300px] animate-pulse" />
      </div>
    );
  }

  return (
    <>
      {!path && (
        <div className="flex justify-center">
          <div className="text-center max-w-xl">
            <h2 className="font-bold text-lg">Item not found</h2>

            <div className="text-zinc-500 font-medium text-sm mt-3">
              We are constantly searching new recipes but couldn't find this
              item in our database yet. You might want to check again later to
              see if we have discovered it.
            </div>
          </div>
        </div>
      )}
      {path && <Path steps={path} />}
    </>
  );
}

export default Results;
