import Header from "@/components/Header";
import { getItemList } from "@/lib/items";
import React, { Suspense } from "react";
import { Skeleton } from "./ui/skeleton";
import Results from "./Results";
import Footer from "./Footer";
import Info from "./Info";
import { getPrecalculatedPath } from "@/lib/precalculatedPath";

async function App({ item }: { item?: string }) {
  const items = await getItemList();
  const path = item ? await getPrecalculatedPath(item) : null;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Header items={items} item={item} />

        {item ? <Results item={item} path={path} /> : <Info />}
      </div>

      <Footer />
    </div>
  );
}

export default App;
