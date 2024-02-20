import Finder from "@/lib/Finder";
import Link from "next/link";
import React, { useEffect } from "react";
import { findBestMatch } from "string-similarity";

function NotFound({ item, finder }: { item: string; finder: Finder }) {
  const [similarItems, setSimilarItems] = React.useState<string[]>([]);
  useEffect(() => {
    if (finder.items.size === 0) {
      return;
    }

    const items = Array.from(finder.items);
    const matches = findBestMatch(item, items);

    const similarItems = matches.ratings
      .filter((rating) => rating.rating > 0.5)
      .map((rating) => rating.target)
      .slice(0, 5);

    setSimilarItems(similarItems);
  }, [finder.items, item]);

  return (
    <div className="flex justify-center">
      <div className="text-center max-w-xl">
        <h2 className="font-bold text-lg">Item not found</h2>

        <div className="text-zinc-500 font-medium text-sm mt-3">
          We could not find this item in the database.
        </div>

        {similarItems.length > 0 && (
          <div className="mt-4">
            <div className="font-medium">Did you mean:</div>
            <ul className="mt-2">
              {similarItems.map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item}`}
                    className="text-blue-600 hover:underline"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotFound;
