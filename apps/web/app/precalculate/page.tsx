import Precalculate from "@/components/Precalculate";
import { getItemList } from "@/lib/items";
import React from "react";

async function PrecalculatePage() {
  if (process.env.NODE_ENV !== "development") {
    return <div>Precalculate is only available in dev environments</div>;
  }

  const items = await getItemList();

  return <Precalculate items={items} />;
}

export default PrecalculatePage;
