import App from "@/components/App";
import React from "react";

function Item({ params: { item } }: { params: { item: string } }) {
  return <App item={decodeURIComponent(item)} />;
}

export default Item;
