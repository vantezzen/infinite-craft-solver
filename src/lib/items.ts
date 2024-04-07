export async function getItemList() {
  const response = await fetch("https://icscdn.vantezzen.io/recipes.json", {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("Failed to load recipes");
  }

  const recipes = await response.json();
  return recipes.items;
}
