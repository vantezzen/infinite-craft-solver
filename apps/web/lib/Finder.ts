interface Recipe {
  first: string;
  second: string;
  result: string;
}

export default class Finder {
  private DEFAULT_ITEMS = ["Water", "Fire", "Wind", "Earth"];
  private recipes: Recipe[] = []; // Array to store all recipes
  private recipeMap: Map<string, Recipe[]> = new Map(); // Map to store recipes for each item
  private recipesLoaded: boolean = false; // Flag to check if recipes are loaded

  private async loadRecipes(): Promise<void> {
    const response = await fetch("/api/recipes");

    if (!response.ok) {
      throw new Error("Failed to load recipes");
    }

    this.recipes = await response.json();

    for (const recipe of this.recipes) {
      if (!this.recipeMap.has(recipe.result)) {
        this.recipeMap.set(recipe.result, []);
      }
      this.recipeMap.get(recipe.result)!.push(recipe);
    }

    this.recipesLoaded = true;
  }

  async findItem(targetItem: string): Promise<Recipe[]> {
    if (this.DEFAULT_ITEMS.includes(targetItem)) {
      return [];
    }

    if (!this.recipesLoaded) {
      await this.loadRecipes();
    }

    console.log(`Loaded ${this.recipes.length} recipes`);

    // Use a cache or directly proceed with the search if not available
    const path = this.findShortestPath(targetItem);
    if (!path) {
      throw new Error("Item cannot be crafted");
    }

    return path;
  }

  private findShortestPath(targetItem: string): Recipe[] | null {
    const itemQueue: {
      item: string;
      recipe: Recipe | null;
    }[] = this.DEFAULT_ITEMS.map((item) => ({
      item,
      recipe: null,
    }));
    const recipesUsed = new Set<Recipe>();
    const discoveredItems = new Set<string>(this.DEFAULT_ITEMS);

    while (itemQueue.length > 0) {
      const { item, recipe } = itemQueue.shift()!;

      if (item === targetItem) {
        console.log("Found path", recipesUsed.size);
        return this.backtrackPath(targetItem, recipe, [...recipesUsed]);
      }

      this.recipes
        .filter((recipe) => {
          const hasDiscoveredItems =
            discoveredItems.has(recipe.first) &&
            discoveredItems.has(recipe.second);
          const resultAlreadyDiscovered = discoveredItems.has(recipe.result);
          const isCircularRecipe =
            recipe.first === recipe.result || recipe.second === recipe.result;
          const containsNothing =
            recipe.first === "Nothing" ||
            recipe.second === "Nothing" ||
            recipe.result === "Nothing";
          return (
            hasDiscoveredItems &&
            !resultAlreadyDiscovered &&
            !isCircularRecipe &&
            !containsNothing
          );
        })
        .forEach((recipe) => {
          discoveredItems.add(recipe.result);
          recipesUsed.add(recipe);
          itemQueue.push({
            item: recipe.result,
            recipe,
          });
        });
    }

    return null;
  }

  private backtrackPath(
    targetItem: string,
    recipe: Recipe | null,
    recipesUsed: Recipe[]
  ): Recipe[] {
    if (!recipe) {
      return [];
    }
    // "recipesUsed" contains recipes that are not part of the shortest path to the target item
    // We want to backtrack from the target item to the source items (this.DEFAULT_ITEMS) to find the shortest path

    const recipes: Recipe[] = [recipe];
    const itemQueue = [recipe?.first, recipe?.second];
    const discoveredItems = new Set<string>([targetItem]);

    while (itemQueue.length > 0) {
      const item = itemQueue.shift()!;

      if (this.DEFAULT_ITEMS.includes(item)) {
        continue;
      }

      const recipeUsedForItem = recipesUsed.find(
        (recipe) => recipe.result === item
      );
      if (!recipeUsedForItem) {
        continue;
      }

      recipes.push(recipeUsedForItem);
      discoveredItems.add(recipeUsedForItem.first);
      discoveredItems.add(recipeUsedForItem.second);
      itemQueue.push(recipeUsedForItem.first, recipeUsedForItem.second);
    }

    return this.removeDuplicates(recipes.reverse());
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
