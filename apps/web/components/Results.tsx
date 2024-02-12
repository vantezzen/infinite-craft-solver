import Path from "@/components/Path";
import Finder from "@/lib/Finder";
import React from "react";

export interface Step {
  first: string;
  second: string;
  result: string;
}

async function Results({ item }: { item: string }) {
  let path: Step[] = [];
  let notFound = false;
  if (item) {
    const finder = new Finder();
    try {
      path = await finder.findItem(item);
    } catch (error) {
      notFound = true;
    }
  }

  return (
    <>
      {notFound && (
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
      {!notFound && <Path steps={path} />}
    </>
  );
}

export default Results;
