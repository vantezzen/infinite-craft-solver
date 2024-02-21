import { decompressRecipes } from "./compression";

export interface Recipe {
  first: string;
  second: string;
  result: string;
}

export enum FinderPhase {
  Search,
  Backtrack,
}

export interface FinderProgess {
  current: number;
  phase: FinderPhase;
}

export default class Finder {
  private DEFAULT_ITEMS = ["Water", "Fire", "Wind", "Earth"];
  private recipes: Recipe[] = []; // Array to store all recipes
  private recipeMap: Map<string, Recipe[]> = new Map(); // Map to store recipes for each item
  private recipesLoaded: boolean = false; // Flag to check if recipes are loaded
  public items = new Set<string>(this.DEFAULT_ITEMS);

  constructor(
    private onProgress: (progress: FinderProgess) => void = () => {}
  ) {}

  private async loadRecipes(): Promise<void> {
    const response = await fetch("https://icscdn.vantezzen.io/recipes.json", {
      cache: "force-cache",
    });

    if (!response.ok) {
      throw new Error("Failed to load recipes");
    }

    const recipes = await response.json();
    if ("compressed" in recipes && recipes.compressed) {
      this.items = new Set(recipes.items);
      this.recipes = decompressRecipes(recipes);
    } else {
      this.items = new Set<string>(
        recipes
          .map((recipe: Recipe) => [recipe.first, recipe.second, recipe.result])
          .flat()
      );
      this.recipes = recipes;
    }

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

    if (!this.items.has(targetItem)) {
      throw new Error("Item not found");
    }

    console.log(`Loaded ${this.recipes.length} recipes`);

    // Use a cache or directly proceed with the search if not available
    const path = await this.findShortestPath(targetItem);
    if (!path) {
      throw new Error("Item cannot be crafted");
    }

    return path;
  }

  private async findShortestPath(targetItem: string): Promise<Recipe[] | null> {
    const itemQueue: {
      item: string;
      recipe: Recipe | null;
    }[] = this.DEFAULT_ITEMS.map((item) => ({
      item,
      recipe: null,
    }));
    const recipesUsed = new Set<Recipe>();
    const discoveredItems = new Set<string>(this.DEFAULT_ITEMS);
    let itemsProcessed = 0;

    const updateInterval = setInterval(() => {
      this.onProgress({
        current: itemsProcessed,
        phase: FinderPhase.Search,
      });
    }, 100);

    while (itemQueue.length > 0) {
      itemsProcessed++;
      const { item, recipe } = itemQueue.shift()!;

      if (item === targetItem) {
        console.log("Found path", recipesUsed.size);
        clearInterval(updateInterval);
        return await this.backtrackPath(targetItem, recipe, [...recipesUsed]);
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

      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    clearInterval(updateInterval);
    return null;
  }

  private async backtrackPath(
    targetItem: string,
    recipe: Recipe | null,
    recipesUsed: Recipe[]
  ): Promise<Recipe[]> {
    if (!recipe) {
      return [];
    }
    // "recipesUsed" contains recipes that are not part of the shortest path to the target item
    // We want to backtrack from the target item to the source items (this.DEFAULT_ITEMS) to find the shortest path

    const recipes: Recipe[] = [recipe];
    const itemQueue = [recipe?.first, recipe?.second];
    const discoveredItems = new Set<string>([targetItem]);

    const updateInfo = () => {
      this.onProgress({
        current: recipes.length,
        phase: FinderPhase.Backtrack,
      });
    };

    const updateInterval = setInterval(() => {
      updateInfo();
    }, 50);
    updateInfo();
    await new Promise((resolve) => setTimeout(resolve, 0));

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

      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    clearInterval(updateInterval);
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
