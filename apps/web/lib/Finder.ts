import { kv } from "@vercel/kv";
import { sql } from "@vercel/postgres";

interface Recipe {
  first: string;
  second: string;
  result: string;
}

export default class Finder {
  private DEFAULT_ITEMS = ["Water", "Fire", "Wind", "Earth"];

  async findItem(targetItem: string): Promise<Recipe[]> {
    // Base case for default items
    if (this.DEFAULT_ITEMS.includes(targetItem)) {
      return [];
    }

    const cachePath = `recipe-${targetItem}`;
    const cachedPath = await kv.get<Recipe[]>(cachePath);
    if (cachedPath) {
      // return cachedPath;
    }

    // Start with a recursive search for the target item
    const path = await this.recursiveFind(targetItem, new Set<string>());
    if (!path) {
      throw new Error("Item cannot be crafted");
    }
    const finalPath = this.removeDuplicates(path);

    await kv.set(cachePath, finalPath, {
      ex: 60 * 60 * 48,
    });
    return finalPath;
  }

  private async recursiveFind(
    item: string,
    visited: Set<string>
  ): Promise<Recipe[] | null> {
    if (this.DEFAULT_ITEMS.includes(item) || visited.has(item)) {
      // If item is a default item or already visited, no recipe is needed
      return null;
    }

    visited.add(item);

    const recipeResult = await sql<Recipe>`
      SELECT * FROM "Recipe"
      WHERE result = ${item}
    `;

    const recipes = recipeResult.rows.map((recipe) => ({
      first: recipe.first,
      second: recipe.second,
      result: recipe.result,
    }));

    for (const recipe of recipes) {
      if (recipe.first === "Nothing" || recipe.second === "Nothing") {
        // "Nothing" is not a valid item, so ignore this recipe
        continue;
      }

      // Recursively find recipes for first and second ingredients if they are not default items
      const pathsForFirst = await this.recursiveFind(
        recipe.first,
        new Set(visited)
      );
      const pathsForSecond = await this.recursiveFind(
        recipe.second,
        new Set(visited)
      );

      // Combine paths for first and second ingredients with the current recipe
      const path = [];
      if (pathsForFirst) path.push(...pathsForFirst);
      if (pathsForSecond) path.push(...pathsForSecond);
      path.push(recipe); // Add the current recipe as the final step

      return path; // Return the combined path for this recipe
    }

    // If no recipe is found for the item, return null
    return null;
  }

  private removeDuplicates(path: Recipe[]): Recipe[] {
    const seen = new Set<string>();
    return path.filter((recipe) => {
      const key = `${recipe.first}-${recipe.second}-${recipe.result}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}
