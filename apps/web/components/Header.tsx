"use client";
import React, { useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { PopoverAnchor } from "@radix-ui/react-popover";
import { useRouter } from "next/navigation";

function Header({ items, item }: { items: string[]; item?: string }) {
  const [query, setQuery] = React.useState(item ?? "");
  const [showItems, setShowItems] = React.useState(false);
  const router = useRouter();

  function onSearch() {
    router.push(`/${encodeURIComponent(query)}`);
  }

  return (
    <header className="p-16 flex justify-center">
      <div className="flex flex-col justify-center max-w-xl text-center gap-1">
        <h1 className="text-4xl font-bold">Infinite Craft Solver</h1>

        <p className="text-zinc-500 mb-6 text-center">
          Get the fastest path to craft any item in Infinite Craft
        </p>

        <div className="flex gap-3">
          <Popover open={showItems}>
            <PopoverAnchor asChild>
              <div className="w-full">
                <Input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setShowItems(event.target.value !== "");
                    setTimeout(() => event.target.focus(), 0);
                  }}
                  onFocus={(event) => {
                    setShowItems(true);
                    setTimeout(() => event.target.focus(), 0);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setShowItems(false);
                    }
                  }}
                  placeholder="Search for an item"
                  className="w-full"
                />
              </div>
            </PopoverAnchor>
            <PopoverContent>
              {items
                .filter((item) =>
                  item.toLowerCase().includes(query.toLowerCase())
                )
                .map((item) => (
                  <div
                    key={item}
                    className="p-2 hover:bg-zinc-100 cursor-pointer"
                    onClick={() => {
                      setQuery(item);
                      setShowItems(false);
                    }}
                  >
                    {item}
                  </div>
                ))}

              {items.length === 0 && (
                <div className="p-2 text-center text-zinc-400">
                  No items found
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Button onClick={onSearch}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
