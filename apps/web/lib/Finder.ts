import prisma from "./db";

interface Recipe {
  first: string;
  second: string;
  result: string;
}

export default class Finder {
  private prisma = prisma;
  private DEFAULT_ITEMS = ["Water", "Fire", "Wind", "Earth"];

  async findItem(targetItem: string): Promise<Recipe[]> {
    // Base case for default items
    if (this.DEFAULT_ITEMS.includes(targetItem)) {
      return [];
    }

    // Start with a recursive search for the target item
    const path = await this.recursiveFind(targetItem, new Set<string>());
    if (!path) {
      throw new Error("Item cannot be crafted");
    }
    return this.removeDuplicates(path);
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

    const recipes = (
      await this.prisma.recipe.findMany({
        where: {
          result: item,
        },
      })
    ).map((recipe) => ({
      first: recipe.first,
      second: recipe.second,
      result: recipe.result,
    }));

    for (const recipe of recipes) {
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
