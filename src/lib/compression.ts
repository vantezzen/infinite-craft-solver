import { Recipe } from "./Finder";

export function compressRecipes(recipes: Recipe[]) {
  const items: string[] = [];
  const compressedRecipes = [];
  for (const recipe of recipes) {
    compressedRecipes.push([
      getOrAddItem(recipe.first, items),
      getOrAddItem(recipe.second, items),
      getOrAddItem(recipe.result, items),
    ]);
  }
  return { items, recipes: compressedRecipes, compressed: true };
}

function getOrAddItem(item: string, items: string[]) {
  const index = items.indexOf(item);
  if (index === -1) {
    items.push(item);
    return items.length - 1;
  }
  return index;
}

export function decompressRecipes({
  items,
  recipes,
}: {
  items: string[];
  recipes: any[];
}): Recipe[] {
  return recipes.map((recipe) => ({
    first: items[recipe[0]]!,
    second: items[recipe[1]]!,
    result: items[recipe[2]]!,
  }));
}
