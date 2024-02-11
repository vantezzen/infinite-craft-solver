import App from "@/components/App";
import React from "react";

export const runtime = "edge";

function Item({ params: { item } }: { params: { item: string } }) {
  return <App item={decodeURIComponent(item)} />;
}

export default Item;
