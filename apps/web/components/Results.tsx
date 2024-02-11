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
      {notFound && <div>Item not found</div>}
      {!notFound && <Path steps={path} />}
    </>
  );
}

export default Results;
