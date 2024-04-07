"use client";
import Path from "@/components/Path";
import Finder, { FinderPhase, FinderProgess, Recipe } from "@/lib/Finder";
import React, { useEffect } from "react";
import { Skeleton } from "./ui/skeleton";
import NotFound from "./NotFound";

function Results({ item }: { item: string }) {
  const [path, setPath] = React.useState<Recipe[] | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [finder, setFinder] = React.useState<Finder | null>(null);
  const [progress, setProgress] = React.useState<FinderProgess>({
    current: 0,
    phase: FinderPhase.Search,
  });

  useEffect(() => {
    const finder = new Finder(setProgress);
    setFinder(finder);

    finder
      .findItem(item)
      .then((path) => {
        setPath(path);
      })
      .catch((error) => {
        setError(error);
      });
  }, [item]);

  if (error && !finder?.items.has(item)) {
    return <NotFound item={item} finder={finder!} />;
  }

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
        <Skeleton>
          <div className="w-[500px] h-[300px] flex flex-col gap-3 justify-center items-center">
            <p className="font-medium">
              {progress.phase === FinderPhase.Search && "Searching"}
              {progress.phase === FinderPhase.Backtrack && "Reducing recipe"}
            </p>

            <p className="text-lg font-bold">{progress.current} recipes</p>
          </div>
        </Skeleton>
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
