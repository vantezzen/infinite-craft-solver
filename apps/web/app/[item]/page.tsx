import App from "@/components/App";
import React from "react";

export const runtime = "edge";
export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

function Item({ params: { item } }: { params: { item: string } }) {
  return <App item={decodeURIComponent(item)} />;
}

export default Item;
