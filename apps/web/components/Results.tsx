"use client";
import Path from "@/components/Path";
import Finder, { Recipe } from "@/lib/Finder";
import React, { useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

function Results({
  item,
  path: precalculatedPath,
}: {
  item: string;
  path: Recipe[] | null;
}) {
  const [path, setPath] = React.useState<Recipe[] | null>(precalculatedPath);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    if (precalculatedPath) {
      return;
    }

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
