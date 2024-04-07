export default async function getStatus() {
  const response = await fetch("https://icscdn.vantezzen.io/recipes.json", {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("Failed to load recipes");
  }

  const compressedRecipes = await response.json();

  const items = compressedRecipes.items.length;
  const recipes = compressedRecipes.recipes.length;
  const newestItemName =
    compressedRecipes.items[compressedRecipes.items.length - 1];

  return {
    recipes,
    items: items,
    newestItemName,
  };
}
