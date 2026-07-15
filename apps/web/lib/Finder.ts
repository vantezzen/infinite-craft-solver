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

type QueueEntry = {
  cost: number;
  item: string;
};

class MinHeap {
  private entries: QueueEntry[] = [];

  get size(): number {
    return this.entries.length;
  }

  push(entry: QueueEntry): void {
    let index = this.entries.push(entry) - 1;

    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (this.entries[parent]!.cost <= entry.cost) break;
      this.entries[index] = this.entries[parent]!;
      index = parent;
    }

    this.entries[index] = entry;
  }

  pop(): QueueEntry | undefined {
    const root = this.entries[0];
    const last = this.entries.pop();
    if (!root || !last || this.entries.length === 0) return root;

    let index = 0;
    let left = 1;
    while (left < this.entries.length) {
      const right = left + 1;
      const child =
        right < this.entries.length &&
        this.entries[right]!.cost < this.entries[left]!.cost
          ? right
          : left;
      if (this.entries[child]!.cost >= last.cost) break;

      this.entries[index] = this.entries[child]!;
      index = child;
      left = index * 2 + 1;
    }

    this.entries[index] = last;
    return root;
  }
}

export default class Finder {
  private static readonly DEFAULT_ITEMS = ["Water", "Fire", "Wind", "Earth"];

  private recipesByIngredient = new Map<string, Recipe[]>();
  private recipesLoaded = false;
  private numRecipes = 0;
  public items = new Set<string>(Finder.DEFAULT_ITEMS);

  constructor(
    private onProgress: (progress: FinderProgess) => void = () => {},
  ) {}

  private async loadRecipes(): Promise<void> {
    const response = await fetch(
      process.env.NEXT_PUBLIC_USE_LOCAL
        ? "/api/recipes"
        : "https://icscdn.vantezzen.io/recipes.json",
      {
        cache: "force-cache",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to load recipes");
    }

    const data = await response.json();
    let recipes: Recipe[];
    if ("compressed" in data && data.compressed) {
      this.items = new Set(data.items);
      recipes = decompressRecipes(data);
    } else {
      recipes = data;
      this.items = new Set(Finder.DEFAULT_ITEMS);
      for (const recipe of recipes) {
        this.items.add(recipe.first);
        this.items.add(recipe.second);
        this.items.add(recipe.result);
      }
    }
    this.numRecipes = recipes.length;

    for (const recipe of recipes) {
      if (
        recipe.first === recipe.result ||
        recipe.second === recipe.result ||
        recipe.first === "Nothing" ||
        recipe.second === "Nothing" ||
        recipe.result === "Nothing"
      ) {
        continue;
      }

      this.addIngredientRecipe(recipe.first, recipe);
      if (recipe.second !== recipe.first) {
        this.addIngredientRecipe(recipe.second, recipe);
      }
    }

    this.recipesLoaded = true;
  }

  private addIngredientRecipe(ingredient: string, recipe: Recipe): void {
    const recipes = this.recipesByIngredient.get(ingredient);
    if (recipes) {
      recipes.push(recipe);
    } else {
      this.recipesByIngredient.set(ingredient, [recipe]);
    }
  }

  async findItem(targetItem: string): Promise<Recipe[]> {
    this.onProgress({
      current: this.numRecipes,
      phase: FinderPhase.Search,
    });
    if (Finder.DEFAULT_ITEMS.includes(targetItem)) {
      return [];
    }

    if (!this.recipesLoaded) {
      await this.loadRecipes();
    }

    if (!this.items.has(targetItem)) {
      throw new Error("Item not found");
    }

    const path = this.findShortestPath(targetItem);
    if (!path) {
      throw new Error("Item cannot be crafted");
    }

    return path;
  }

  private findShortestPath(targetItem: string): Recipe[] | null {
    const costs = new Map<string, number>();
    const settledItems = new Set<string>();
    const recipeForItem = new Map<string, Recipe>();
    const queue = new MinHeap();
    let recipesProcessed = 0;

    for (const item of Finder.DEFAULT_ITEMS) {
      costs.set(item, 0);
      queue.push({ cost: 0, item });
    }

    this.onProgress({ current: 0, phase: FinderPhase.Search });

    while (queue.size > 0) {
      const current = queue.pop()!;
      if (
        settledItems.has(current.item) ||
        costs.get(current.item) !== current.cost
      ) {
        continue;
      }

      settledItems.add(current.item);
      if (current.item === targetItem) {
        this.onProgress({
          current: recipesProcessed,
          phase: FinderPhase.Search,
        });
        return this.buildPath(targetItem, recipeForItem);
      }

      for (const recipe of this.recipesByIngredient.get(current.item) ?? []) {
        if (
          !settledItems.has(recipe.first) ||
          !settledItems.has(recipe.second)
        ) {
          continue;
        }

        recipesProcessed++;
        if (recipesProcessed % 1000 === 0) {
          this.onProgress({
            current: recipesProcessed,
            phase: FinderPhase.Search,
          });
        }

        const cost =
          costs.get(recipe.first)! +
          (recipe.first === recipe.second ? 0 : costs.get(recipe.second)!) +
          1;

        if (cost >= (costs.get(recipe.result) ?? Infinity)) {
          continue;
        }

        costs.set(recipe.result, cost);
        recipeForItem.set(recipe.result, recipe);
        queue.push({ cost, item: recipe.result });
      }
    }

    this.onProgress({
      current: recipesProcessed,
      phase: FinderPhase.Search,
    });
    return null;
  }

  private buildPath(
    targetItem: string,
    recipeForItem: Map<string, Recipe>,
  ): Recipe[] {
    const path: Recipe[] = [];
    const craftedItems = new Set(Finder.DEFAULT_ITEMS);
    const stack = [{ item: targetItem, ready: false }];

    this.onProgress({ current: 0, phase: FinderPhase.Backtrack });

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (craftedItems.has(current.item)) continue;

      const recipe = recipeForItem.get(current.item);
      if (!recipe) continue;

      if (current.ready) {
        path.push(recipe);
        craftedItems.add(recipe.result);
        continue;
      }

      stack.push({ item: current.item, ready: true });
      stack.push({ item: recipe.second, ready: false });
      stack.push({ item: recipe.first, ready: false });
    }

    this.onProgress({ current: path.length, phase: FinderPhase.Backtrack });
    return path;
  }
}
