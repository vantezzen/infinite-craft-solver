"use client";
import Finder from "@/lib/Finder";
import React from "react";
import { Button } from "./ui/button";

function Precalculate({ items }: { items: string[] }) {
  const [currentItem, setCurrentItem] = React.useState<string | null>(null);

  const startPrecalculation = async () => {
    const finder = new Finder();
    const itemQueue = [...items].sort(() => Math.random() - 0.5);

    for (const item of itemQueue) {
      setCurrentItem(item);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const path = await finder.findItem(item);
        console.log(path);

        await fetch(`/api/precalculate/${item}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path }),
        });
        window.location.reload();
      } catch (error) {
        console.error("Could not precalculate", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col gap-3 p-12">
      <h1 className="text-4xl font-bold">Precalculate</h1>

      {!currentItem && <Button onClick={startPrecalculation}>Start</Button>}

      {currentItem && (
        <div>
          <p>Precalculating "{currentItem}"</p>
        </div>
      )}
    </div>
  );
}

export default Precalculate;
