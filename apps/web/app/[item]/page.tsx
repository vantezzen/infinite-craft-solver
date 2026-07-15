import App from "@/components/App";
import React from "react";

async function Item({ params }: { params: Promise<{ item: string }> }) {
  const { item } = await params;
  return <App item={decodeURIComponent(item)} />;
}

export default Item;
