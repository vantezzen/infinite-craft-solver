import Header from "@/components/Header";
import { getItemList } from "@/lib/items";
import React from "react";
import Results from "./Results";
import Footer from "./Footer";
import Info from "./Info";

async function App({ item }: { item?: string }) {
  const items = await getItemList();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Header items={items} item={item} />

        {item ? <Results item={item} /> : <Info />}
      </div>

      <Footer />
    </div>
  );
}

export default App;
